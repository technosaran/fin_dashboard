/**
 * Unit tests for FinanceContext helper patterns.
 *
 * These tests verify the core logic used by makeDeleteFromTable,
 * the interval ref pattern, and Promise.allSettled behaviour — without
 * mounting the full React context tree.
 */

// ─── makeDeleteFromTable logic ────────────────────────────────────────────────

describe('makeDeleteFromTable pattern', () => {
  // Mirrors the actual implementation in FinanceContext.tsx
  function makeDeleteFromTable<T extends { id: number }>(
    deleteRow: (id: number) => Promise<{ error: Error | null }>,
    setter: (fn: (prev: T[]) => T[]) => void
  ) {
    return async (id: number) => {
      const { error } = await deleteRow(id);
      if (error) throw error;
      setter((prev) => prev.filter((item) => item.id !== id));
    };
  }

  it('calls setter to remove item when delete succeeds', async () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
    let state = [...items];

    const mockDelete = jest.fn().mockResolvedValue({ error: null });
    const setter = jest.fn().mockImplementation((fn: (prev: typeof items) => typeof items) => {
      state = fn(state);
    });

    const deleteFn = makeDeleteFromTable(mockDelete, setter);
    await deleteFn(2);

    expect(mockDelete).toHaveBeenCalledWith(2);
    expect(state).toEqual([{ id: 1 }, { id: 3 }]);
  });

  it('throws when delete returns an error', async () => {
    const mockError = new Error('DB constraint violation');
    const mockDelete = jest.fn().mockResolvedValue({ error: mockError });
    const setter = jest.fn();

    const deleteFn = makeDeleteFromTable(mockDelete, setter);

    await expect(deleteFn(99)).rejects.toThrow('DB constraint violation');
    // Setter must NOT be called if the DB call failed
    expect(setter).not.toHaveBeenCalled();
  });

  it('removes the correct item from a list of many', async () => {
    const items = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `item-${i + 1}` }));
    let state = [...items];

    const mockDelete = jest.fn().mockResolvedValue({ error: null });
    const setter = jest.fn().mockImplementation((fn: (prev: typeof items) => typeof items) => {
      state = fn(state);
    });

    const deleteFn = makeDeleteFromTable(mockDelete, setter);
    await deleteFn(5);

    expect(state.find((i) => i.id === 5)).toBeUndefined();
    expect(state).toHaveLength(9);
  });
});

// ─── refreshLivePricesRef pattern ─────────────────────────────────────────────

describe('refreshLivePricesRef (interval timer bug fix)', () => {
  /**
   * The bug: previously, refreshLivePrices was added directly to the setInterval
   * deps array. Since refreshLivePrices depends on stocks/mutualFunds/bonds state,
   * every price update recreated the function and reset the 60s timer.
   *
   * The fix: useRef stores the latest version. The interval closure captures the ref,
   * not the function. The interval therefore never resets on price updates.
   *
   * This test verifies the ref pattern works as a stable wrapper.
   */
  it('always calls the latest function via ref even after reassignment', async () => {
    // Simulate the useRef + useEffect pattern
    const latestFn = jest.fn();
    const ref = { current: latestFn };

    // Interval closure captures `ref`, not `latestFn`
    const callViaRef = () => ref.current();

    callViaRef();
    expect(latestFn).toHaveBeenCalledTimes(1);

    // Simulate function being reassigned (e.g., stocks state changed)
    const newFn = jest.fn();
    ref.current = newFn;

    callViaRef();
    // The OLD function is NOT called again
    expect(latestFn).toHaveBeenCalledTimes(1);
    // The NEW function IS called
    expect(newFn).toHaveBeenCalledTimes(1);
  });

  it('interval does not restart when ref updates (timer stability)', () => {
    jest.useFakeTimers();

    const callLog: number[] = [];
    let version = 0;

    const ref = {
      current: () => {
        callLog.push(version);
      },
    };

    // Set up interval using ref pattern
    const id = setInterval(() => ref.current(), 60000);

    // Advance 60s — first call
    jest.advanceTimersByTime(60000);
    expect(callLog).toHaveLength(1);

    // Simulate refreshLivePrices being recreated (version bump)
    version = 1;
    ref.current = () => {
      callLog.push(version);
    };

    // Advance another 60s — second call, NO timer reset
    jest.advanceTimersByTime(60000);
    expect(callLog).toHaveLength(2);
    expect(callLog[1]).toBe(1); // used updated function

    clearInterval(id);
    jest.useRealTimers();
  });
});

// ─── Promise.allSettled data loading ──────────────────────────────────────────

describe('Promise.allSettled — partial failure resilience', () => {
  it('continues processing when one query fails', async () => {
    const results = await Promise.allSettled([
      Promise.resolve({ data: [1, 2, 3], error: null }),
      Promise.reject(new Error('Network timeout')),
      Promise.resolve({ data: [7, 8, 9], error: null }),
    ]);

    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');
    expect(results[2].status).toBe('fulfilled');

    // The fulfilled results should still have their data
    if (results[0].status === 'fulfilled') {
      expect(results[0].value.data).toEqual([1, 2, 3]);
    }
    if (results[2].status === 'fulfilled') {
      expect(results[2].value.data).toEqual([7, 8, 9]);
    }
  });

  it('correctly identifies failed queries by status', async () => {
    const queries = [
      Promise.resolve({ data: 'accounts', error: null }),
      Promise.reject(new Error('bonds table not found')),
      Promise.resolve({ data: 'stocks', error: null }),
    ];

    const results = await Promise.allSettled(queries);
    const failed = results.filter((r) => r.status === 'rejected');
    const succeeded = results.filter((r) => r.status === 'fulfilled');

    expect(failed).toHaveLength(1);
    expect(succeeded).toHaveLength(2);
  });

  it('all succeed when no queries fail', async () => {
    const results = await Promise.allSettled([
      Promise.resolve({ data: 'a' }),
      Promise.resolve({ data: 'b' }),
      Promise.resolve({ data: 'c' }),
    ]);

    expect(results.every((r) => r.status === 'fulfilled')).toBe(true);
  });
});

// ─── Context value memoization ────────────────────────────────────────────────

describe('State immutability in CRUD setters', () => {
  it('filter produces a new array reference (not mutation)', () => {
    const original = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const filtered = original.filter((item) => item.id !== 2);

    expect(filtered).not.toBe(original); // new reference
    expect(filtered).toHaveLength(2);
    expect(original).toHaveLength(3); // original unchanged
  });

  it('map produces a new array reference (not mutation)', () => {
    const original = [
      { id: 1, value: 'a' },
      { id: 2, value: 'b' },
    ];
    const updated = original.map((item) => (item.id === 1 ? { ...item, value: 'updated' } : item));

    expect(updated).not.toBe(original);
    expect(updated[0].value).toBe('updated');
    expect(original[0].value).toBe('a'); // original unchanged
  });
});
