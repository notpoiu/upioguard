This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy is using vercel.

postgres included in template:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnotpoiu%2Fupioguard.git&env=AUTH_SECRET,AUTH_DISCORD_ID,AUTH_DISCORD_SECRET&envDescription=Auth.js%20required%20secrets%2C%20to%20generate%20AUTH_SECRET%2C%20run%20this%20command%20in%20terminal%3A%20%60openssl%20rand%20-base64%2033%60%20And%20Discord_ID%20and%20Discord_Secret%20are%20from%20a%20oauth%20application%20made%20in%20discord%20developer%20portal&demo-title=upioguard&demo-description=a%20lua%20script%20protection%20service&demo-url=https%3A%2F%2Fupioguard.vercel.app&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D)

without postgres included in template:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnotpoiu%2Fupioguard.git&env=AUTH_SECRET,AUTH_DISCORD_ID,AUTH_DISCORD_SECRET&envDescription=Auth.js%20required%20secrets%2C%20to%20generate%20AUTH_SECRET%2C%20run%20this%20command%20in%20terminal%3A%20%60openssl%20rand%20-base64%2033%60%20And%20Discord_ID%20and%20Discord_Secret%20are%20from%20a%20oauth%20application%20made%20in%20discord%20developer%20portal&demo-title=upioguard&demo-description=a%20lua%20script%20protection%20service&demo-url=https%3A%2F%2Fupioguard.vercel.app)