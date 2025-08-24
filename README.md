# Discord Ticket Bot Dashboard

A modern, responsive web dashboard for managing your Discord Ticket Bot. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📊 **Real-time Statistics** - Overview of guilds, tickets, and performance metrics
- 🔧 **Guild Management** - View and manage Discord server configurations
- 🎫 **Ticket Tracking** - Monitor all support tickets across servers
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🚀 **Fast Performance** - Built with Next.js for optimal loading speeds
- 🎨 **Discord-themed UI** - Familiar Discord color scheme and styling

## Prerequisites

- Node.js 18+ and npm/yarn
- Access to the same PostgreSQL database used by your Discord bot
- Your Discord bot should be running with the provided Java codebase

## Quick Setup

### 1. Clone and Install

```bash
# Create new Next.js project
npx create-next-app@latest discord-ticket-dashboard --typescript --tailwind --eslint --app
cd discord-ticket-dashboard

# Install dependencies
npm install pg @types/pg lucide-react recharts date-fns
```

### 2. Copy Dashboard Files

Copy all the provided files to your project directory:

```
discord-ticket-dashboard/
├── app/
│   ├── api/
│   │   ├── stats/route.ts
│   │   ├── guilds/route.ts
│   │   └── tickets/route.ts
│   ├── guilds/
│   │   └── page.tsx
│   ├── tickets/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── database.ts
├── .env.example
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

### 3. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your database configuration:

```env
# Use the SAME DATABASE_URL as your Discord bot
DATABASE_URL=postgresql://username:password@host:port/database

# Optional dashboard security
DASHBOARD_SECRET=your_secret_key_here
```

### 4. Run the Dashboard

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000` to access your dashboard!

## Deployment to Vercel

### 1. Push to GitHub

Create a new repository and push your code:

```bash
git init
git add .
git commit -m "Initial dashboard setup"
git branch -M main
git remote add origin https://github.com/yourusername/discord-ticket-dashboard.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Set environment variables in Vercel:
   - `DATABASE_URL`: Your Railway PostgreSQL URL
   - `NODE_ENV`: `production`

### 3. Custom Domain (Optional)

Add your custom domain in Vercel's project settings.

## Database Connection

The dashboard connects to the same PostgreSQL database as your Discord bot. It reads from these tables:

- `guild_configs` - Server configurations
- `support_roles` - Support role assignments
- `ticket_logs` - Ticket history and statistics

**Important**: Make sure your Discord bot is creating the `ticket_logs` table. You may need to update your Java code to log ticket activities.

## Adding Ticket Logging to Java Bot

Add this method to your `TicketHandler.java`:

```java
private void logTicketActivity(String guildId, String channelId, String channelName, 
                              String ownerId, String ticketType, int ticketNumber) {
    try {
        String query = """
            INSERT INTO ticket_logs (guild_id, channel_id, channel_name, owner_id, ticket_type, ticket_number, status)
            VALUES (?, ?, ?, ?, ?, ?, 'open')
            """;
            
        // Execute with your database connection
        // Implementation depends on your database setup
        
    } catch (Exception e) {
        System.err.println("Failed to log ticket activity: " + e.getMessage());
    }
}
```

Call this method when creating tickets to populate the dashboard.

## Dashboard Features

### Overview Page
- Total guilds and configurations
- Ticket statistics and trends
- Daily activity charts
- Top performing servers

### Guild Management
- View all connected Discord servers
- Check configuration status
- Monitor ticket activity per guild
- Delete guild configurations

### Ticket Tracking
- View all tickets across servers
- Filter by status, type, and guild
- Monitor resolution times
- Track ticket trends

## Customization

### Colors and Styling
Edit `tailwind.config.js` to customize the Discord theme colors:

```javascript
theme: {
  extend: {
    colors: {
      'discord-blue': '#5865F2',
      'discord-green': '#57F287',
      // Add your custom colors
    },
  },
},
```

### Additional Features

You can extend the dashboard by:
- Adding authentication
- Creating detailed ticket views
- Adding user management
- Implementing real-time updates with WebSockets
- Adding more analytics and charts

## Security Notes

- Always use environment variables for sensitive data
- The dashboard currently has no authentication - add auth for production use
- Ensure your database connection uses SSL in production
- Consider rate limiting for API endpoints

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure your PostgreSQL server allows connections
- Check firewall settings for Railway/cloud databases

### Build Errors
- Make sure all dependencies are installed
- Verify TypeScript configuration
- Check for missing environment variables

### Performance Issues
- Enable database connection pooling
- Add caching for frequently accessed data
- Optimize database queries

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify database connectivity
3. Ensure your Discord bot is running and logging data
4. Check Vercel deployment logs

## License

This dashboard is designed to work with your Discord Ticket Bot system. Make sure to comply with Discord's Terms of Service and API guidelines.