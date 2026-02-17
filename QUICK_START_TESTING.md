# Quick Start Testing Guide

## 🚀 Get Started in 5 Minutes

### 1. Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

### 2. Create Your First User

1. Navigate to http://localhost:3000/login
2. Click "Sign Up" (if available) or use Supabase Dashboard to create a user:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to Authentication > Users
   - Click "Add User"
   - Enter email and password

### 3. Login and Explore

Login with your credentials and you'll see the dashboard.

---

## 🧪 Quick Feature Tests

### Test 1: Add a Stock (2 minutes)

1. Click "Stocks" in sidebar
2. Click "Add Stock" button
3. Search for "RELIANCE" or "TCS"
4. Select from dropdown
5. Enter quantity (e.g., 10)
6. Enter average price (e.g., 2500)
7. Click "Add Stock"
8. ✅ Stock should appear with live price from Yahoo Finance

### Test 2: Add a Mutual Fund (2 minutes)

1. Click "Mutual Funds" in sidebar
2. Click "Add Fund"
3. Search for a scheme code (e.g., "119551" for HDFC Balanced Advantage Fund)
4. Enter units (e.g., 100)
5. Enter average NAV (e.g., 350)
6. Click "Add Fund"
7. ✅ Fund should appear with current NAV from MFAPI

### Test 3: Create an Account (1 minute)

1. Click "Accounts" in sidebar
2. Click "Add Account"
3. Enter account name (e.g., "HDFC Savings")
4. Select bank name
5. Select account type (Savings/Current/Wallet)
6. Enter initial balance
7. Click "Add Account"
8. ✅ Account should appear in list

### Test 4: Record a Transaction (2 minutes)

1. Click "Ledger" in sidebar
2. Click "Add Transaction"
3. Select transaction type (Income/Expense)
4. Enter description (e.g., "Salary")
5. Select category
6. Enter amount
7. Select account
8. Click "Add Transaction"
9. ✅ Transaction should appear and account balance should update

### Test 5: Set a Financial Goal (1 minute)

1. Click "Goals" in sidebar
2. Click "Add Goal"
3. Enter goal name (e.g., "Emergency Fund")
4. Enter target amount (e.g., 500000)
5. Enter current amount (e.g., 100000)
6. Select deadline date
7. Select category
8. Click "Add Goal"
9. ✅ Goal should appear with progress bar

### Test 6: Live Price Refresh (30 seconds)

1. Go to Stocks page
2. Note current prices
3. Click the lightning bolt (⚡) refresh button
4. ✅ Prices should update (may change slightly or stay same if market is closed)

### Test 7: Export Data (30 seconds)

1. Go to Ledger page
2. Click "Export CSV" button
3. ✅ CSV file should download with all transactions

---

## 🔍 API Testing

### Test Stock API

```bash
# Test stock quote
curl "http://localhost:3000/api/stocks/quote?symbol=RELIANCE"

# Test stock search
curl "http://localhost:3000/api/stocks/search?q=TCS"

# Test batch quotes
curl "http://localhost:3000/api/stocks/batch?symbols=RELIANCE,TCS,INFY"
```

### Test Mutual Fund API

```bash
# Test MF quote
curl "http://localhost:3000/api/mf/quote?code=119551"

# Test MF search
curl "http://localhost:3000/api/mf/search?q=HDFC"

# Test batch quotes
curl "http://localhost:3000/api/mf/batch?codes=119551,120503"
```

### Test Forex API

```bash
# Test forex quote
curl "http://localhost:3000/api/forex/quote?pair=USDINR"

# Test batch quotes
curl "http://localhost:3000/api/forex/batch?pairs=USDINR,EURINR,GBPINR"
```

---

## 🐛 Common Issues & Solutions

### Issue: "Missing environment variables"

**Solution:** Copy `.env.example` to `.env.local` and add your Supabase credentials

### Issue: "Failed to fetch stock quote"

**Solution:**

- Check internet connection
- Yahoo Finance may be rate limiting (wait a minute)
- Try a different stock symbol

### Issue: "User not authenticated"

**Solution:**

- Make sure you're logged in
- Check Supabase Auth is working
- Clear browser cache and login again

### Issue: "Database error"

**Solution:**

- Check Supabase project is active
- Verify migrations are applied: `supabase db push --linked`
- Check RLS policies are enabled

### Issue: "Build fails"

**Solution:**

- Delete `.next` folder: `rm -rf .next`
- Delete `node_modules`: `rm -rf node_modules`
- Reinstall: `npm install`
- Rebuild: `npm run build`

---

## 📊 Expected Behavior

### Dashboard

- Shows total net worth
- Displays portfolio breakdown (stocks, MF, bonds, cash)
- Shows recent transactions
- Displays goal progress

### Stock Portfolio

- Lists all stocks with current prices
- Shows P&L (profit/loss) for each stock
- Displays day's change
- Shows sector allocation chart
- Allows adding/editing/deleting stocks
- Supports stock transactions (buy/sell)

### Mutual Funds

- Lists all MF holdings with current NAV
- Shows P&L for each fund
- Displays category-wise allocation
- Allows adding/editing/deleting funds
- Supports MF transactions (buy/sell/SIP)

### Accounts

- Lists all accounts with balances
- Shows total cash across accounts
- Allows adding/editing/deleting accounts
- Supports adding funds

### Ledger

- Shows all transactions (income/expense)
- Allows filtering by type, category, date
- Supports search
- Allows CSV export
- Shows running balance

### Goals

- Lists all financial goals
- Shows progress bars
- Displays deadline and target amount
- Allows adding/editing/deleting goals

---

## 🎯 Performance Benchmarks

### Expected Response Times

- Stock quote API: < 2 seconds
- MF quote API: < 3 seconds
- Batch APIs: < 5 seconds
- Database queries: < 500ms
- Page load: < 2 seconds

### Expected Behavior

- Smooth scrolling
- No layout shifts
- Responsive on mobile
- No console errors
- Proper loading states

---

## 🔐 Security Testing

### Test User Isolation

1. Create two users (User A and User B)
2. Login as User A, add some stocks
3. Logout and login as User B
4. ✅ User B should NOT see User A's stocks
5. Add stocks for User B
6. Logout and login as User A
7. ✅ User A should only see their own stocks

### Test RLS Policies

1. Open browser console
2. Try to query another user's data directly via Supabase client
3. ✅ Should be blocked by RLS policies

---

## 📱 Mobile Testing

### Test on Mobile Device

1. Open http://localhost:3000 on mobile browser
2. ✅ Layout should be responsive
3. ✅ Sidebar should collapse to hamburger menu
4. ✅ Tables should be scrollable
5. ✅ Forms should be easy to fill
6. ✅ Buttons should be touch-friendly

---

## 🎨 UI/UX Checklist

- [ ] All pages load without errors
- [ ] Navigation works smoothly
- [ ] Forms validate input properly
- [ ] Error messages are clear
- [ ] Success notifications appear
- [ ] Loading states show during API calls
- [ ] Empty states display when no data
- [ ] Responsive on mobile, tablet, desktop
- [ ] Dark theme looks good
- [ ] Icons render correctly
- [ ] Charts display properly
- [ ] CSV export works
- [ ] Search and filter work
- [ ] Modals open and close properly
- [ ] Confirmation dialogs appear for delete actions

---

## 🚀 Next Steps After Testing

1. **If everything works:**
   - Deploy to production (Vercel recommended)
   - Set up monitoring
   - Configure analytics
   - Share with users

2. **If issues found:**
   - Check PROJECT_AUDIT_COMPLETE.md for troubleshooting
   - Review DEVELOPER_GUIDE.md for detailed docs
   - Check GitHub issues for similar problems
   - Create new issue with details

---

## 📞 Support

- **Documentation:** Check DEVELOPER_GUIDE.md
- **API Docs:** See API.md
- **Database:** See DATABASE.md
- **Issues:** Create GitHub issue
- **Questions:** Check DOCUMENTATION.md

---

_Happy Testing! 🎉_
