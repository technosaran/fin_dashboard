# FINCORE - Quick Reference Card

## 🚀 Quick Start

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

---

## 📁 Key Files

| File                                | Purpose                                      |
| ----------------------------------- | -------------------------------------------- |
| `.env.local`                        | Environment variables (Supabase credentials) |
| `app/layout.tsx`                    | Root layout                                  |
| `app/page.tsx`                      | Dashboard home                               |
| `app/components/FinanceContext.tsx` | State management                             |
| `lib/supabase.ts`                   | Supabase client                              |
| `lib/database.types.ts`             | Database types                               |
| `supabase/migrations/`              | Database migrations                          |

---

## 🔑 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📊 Database Tables

| Table                      | Purpose                   |
| -------------------------- | ------------------------- |
| `accounts`                 | Bank accounts and wallets |
| `transactions`             | Income and expenses       |
| `stocks`                   | Stock holdings            |
| `stock_transactions`       | Buy/sell transactions     |
| `mutual_funds`             | MF holdings               |
| `mutual_fund_transactions` | MF transactions           |
| `bonds`                    | Bond holdings             |
| `bond_transactions`        | Bond transactions         |
| `fno_trades`               | F&O trades                |
| `forex_transactions`       | Forex transactions        |
| `goals`                    | Financial goals           |
| `family_transfers`         | Family money transfers    |
| `app_settings`             | User settings             |

---

## 🌐 API Endpoints

### Stocks

- `GET /api/stocks/quote?symbol=RELIANCE` - Get stock price
- `GET /api/stocks/search?q=TCS` - Search stocks
- `GET /api/stocks/batch?symbols=RELIANCE,TCS` - Batch quotes

### Mutual Funds

- `GET /api/mf/quote?code=119551` - Get NAV
- `GET /api/mf/search?q=HDFC` - Search schemes
- `GET /api/mf/batch?codes=119551,120503` - Batch NAVs

### Bonds

- `GET /api/bonds/quote?isin=INE002A01018` - Get bond price
- `GET /api/bonds/search?q=HDFC` - Search bonds
- `GET /api/bonds/batch?isins=INE002A01018` - Batch quotes

### Forex

- `GET /api/forex/quote?pair=USDINR` - Get exchange rate
- `GET /api/forex/batch?pairs=USDINR,EURINR` - Batch rates

### F&O

- `GET /api/fno/batch?instruments=NIFTY,BANKNIFTY` - Batch data

---

## 🎨 CSS Variables

```css
/* Colors */
--accent: #6366f1 --success: #10b981 --warning: #f59e0b --error: #ef4444 /* Spacing */
  --spacing-xs: 8px --spacing-sm: 12px --spacing-md: 16px --spacing-lg: 24px --spacing-xl: 32px
  /* Breakpoints */ --breakpoint-sm: 640px --breakpoint-md: 768px --breakpoint-lg: 1024px
  --breakpoint-xl: 1280px;
```

---

## 🔧 Common Tasks

### Add a New Feature Page

1. Create `app/feature/page.tsx`
2. Create `app/feature/FeatureClient.tsx`
3. Add route to sidebar in `app/components/Sidebar.tsx`
4. Add types to `lib/types/index.ts`
5. Add API route if needed in `app/api/feature/`

### Add a New Database Table

1. Create migration: `supabase migration new table_name`
2. Write SQL in `supabase/migrations/`
3. Apply: `supabase db push --linked`
4. Generate types: `supabase gen types typescript --linked > lib/database.types.ts`
5. Add to FinanceContext if needed

### Fix TypeScript Errors

1. Check `lib/database.types.ts` is up-to-date
2. Run `npm run build` to see errors
3. Fix type mismatches
4. Regenerate types if needed

---

## 🐛 Troubleshooting

### Build Fails

```bash
rm -rf .next node_modules
npm install
npm run build
```

### Database Issues

```bash
supabase db pull --linked
supabase gen types typescript --linked > lib/database.types.ts
```

### API Not Working

- Check `.env.local` has correct credentials
- Verify Supabase project is active
- Check browser console for errors
- Test API directly: `curl http://localhost:3000/api/stocks/quote?symbol=RELIANCE`

### Authentication Issues

- Clear browser cache
- Check Supabase Auth is enabled
- Verify RLS policies are active
- Check user exists in Supabase dashboard

---

## 📱 Responsive Breakpoints

| Device  | Width          | Class          |
| ------- | -------------- | -------------- |
| Mobile  | < 640px        | `.hide-sm`     |
| Tablet  | 640px - 1024px | `.hide-md`     |
| Desktop | > 1024px       | `.hide-mobile` |

---

## ⌨️ Keyboard Shortcuts

| Key           | Action               |
| ------------- | -------------------- |
| `Tab`         | Navigate forward     |
| `Shift + Tab` | Navigate backward    |
| `Enter`       | Activate button/link |
| `Escape`      | Close modal          |
| `Space`       | Activate button      |

---

## 🎯 Best Practices

### Code

- Use TypeScript strict mode
- Follow ESLint rules
- Format with Prettier
- Write meaningful commit messages
- Add comments for complex logic

### Database

- Always use RLS policies
- Add indexes for performance
- Use transactions for related operations
- Validate input before insert
- Handle errors gracefully

### UI/UX

- Minimum 44x44px touch targets
- Use semantic HTML
- Add ARIA labels
- Provide loading states
- Show error messages clearly
- Give success feedback

### Performance

- Memoize expensive calculations
- Debounce search inputs
- Cache API responses
- Lazy load heavy components
- Optimize images

---

## 📚 Documentation

| Document                    | Purpose            |
| --------------------------- | ------------------ |
| `README.md`                 | Project overview   |
| `DEVELOPER_GUIDE.md`        | Development guide  |
| `API.md`                    | API documentation  |
| `DATABASE.md`               | Database schema    |
| `ARCHITECTURE.md`           | System design      |
| `PROJECT_AUDIT_COMPLETE.md` | Audit report       |
| `QUICK_START_TESTING.md`    | Testing guide      |
| `UI_UX_IMPROVEMENTS.md`     | UI/UX improvements |
| `FINAL_PROJECT_STATUS.md`   | Project status     |
| `QUICK_REFERENCE.md`        | This file          |

---

## 🔗 Useful Links

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev
- **Recharts**: https://recharts.org

---

## 📞 Support

- **Issues**: Create GitHub issue
- **Questions**: Check DEVELOPER_GUIDE.md
- **Bugs**: Report with reproduction steps
- **Features**: Open discussion on GitHub

---

## ✅ Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Build successful
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] RLS policies active
- [ ] API endpoints tested
- [ ] Mobile responsive
- [ ] Accessibility checked
- [ ] Performance optimized
- [ ] Documentation updated

---

## 🚀 Deploy Commands

### Vercel

```bash
vercel deploy
```

### Cloudflare Pages

```bash
npm run build
wrangler pages publish .next
```

### Docker

```bash
docker build -t fincore .
docker run -p 3000:3000 fincore
```

---

**Keep this card handy for quick reference!** 📌
