# SoaAL RAG Dashboard

A modern ReactJS dashboard for managing RAG (Retrieval-Augmented Generation) services with beautiful glass morphism UI design, built-in multi-language support, and comprehensive tenant management features.

## Features

### 🎨 Modern UI
- **Glass Morphism Design**: Beautiful frosted glass effects throughout the interface
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations**: Subtle transitions and hover effects for a polished experience
- **Dark Theme**: Elegant dark gradient background with animated orbs

### 🌍 Multi-Language Support
- **English & Arabic**: Full bilingual support with easy language switching
- **RTL Support**: Right-to-start layout for Arabic language
- **i18next**: Robust internationalization framework

### 📊 Dashboard Features
- **Tenant Management**: Create and manage multiple tenant accounts
- **Document Management**: Upload files or ingest from URLs
- **Pending Questions**: Answer unanswered user questions
- **Feedback Analytics**: Visual charts and detailed feedback analysis
- **Telegram Integration**: Connect Telegram bots to your tenants
- **Admin Panel**: Super admin can manage all users and tenants

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom glass morphism theme
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Internationalization**: i18next + react-i18next
- **Charts**: Recharts
- **File Upload**: React Dropzone
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure API base URL**:
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist` directory.

## Project Structure

```
soaal-rag-dashboard/
├── src/
│   ├── components/          # Reusable components
│   │   └── ProtectedRoute.tsx
│   ├── context/             # React context providers
│   │   └── AuthContext.tsx
│   ├── i18n/               # Internationalization
│   │   └── index.ts
│   ├── layouts/            # Page layouts
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   ├── pages/              # Page components
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Tenants.tsx
│   │   ├── Documents.tsx
│   │   ├── Questions.tsx
│   │   ├── Analytics.tsx
│   │   ├── Telegram.tsx
│   │   └── Admin.tsx
│   ├── services/           # API services
│   │   └── api.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## API Integration

The dashboard integrates with the RAG backend API documented in `DASHBOARD_API.md`. All API calls are made through the centralized API service in `src/services/api.ts`.

### API Endpoints Used

#### Authentication
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout

#### Tenant Management
- `GET /tenants` - List all tenants
- `POST /tenants` - Create new tenant
- `GET /tenants/{id}` - Get tenant details
- `POST /tenants/{id}/api-keys` - Create API key

#### Document Management
- `GET /tenants/{id}/documents` - List documents
- `POST /tenants/{id}/documents` - Upload document
- `POST /tenants/{id}/documents/ingest-url` - Ingest from URL
- `DELETE /tenants/{id}/documents/{doc_id}` - Delete document

#### Pending Questions
- `GET /tenants/{id}/pending-questions` - List questions
- `POST /tenants/{id}/pending-questions/{q_id}/answer` - Answer question

#### Feedback Analytics
- `GET /tenants/{id}/feedback/stats` - Get statistics
- `GET /tenants/{id}/feedback` - List detailed feedback

#### Telegram Integration
- `POST /tenants/{id}/telegram/bot-token` - Set bot token

#### Admin APIs (Super Admin Only)
- `GET /admin/users` - List all users
- `PUT /admin/users/{id}/role` - Update user role
- `DELETE /admin/users/{id}` - Disable user
- `GET /admin/tenants` - List all tenants
- `PUT /admin/tenants/{id}/status` - Update tenant status
- `DELETE /admin/tenants/{id}` - Delete tenant

## User Roles

### User
- Can create and manage own tenants
- Can upload documents to their tenants
- Can answer pending questions
- Can view feedback analytics
- Can configure Telegram bots

### Admin
- All user permissions
- Can manage other users (except super_admin)
- Can disable/delete users
- Can promote users to admin

### Super Admin
- All admin permissions
- Can manage all tenants in the system
- Can update tenant status (active/suspended/blocked)
- Can delete any tenant

## Customization

### Colors
Custom colors are defined in `tailwind.config.js`:
- `primary`: Main accent color (teal/cyan)
- `glass`: Glass effect colors
- `dark`: Dark theme colors

### Glass Effect Classes
Custom glass morphism utilities in `src/index.css`:
- `.glass` - Basic glass effect
- `.glass-strong` - Stronger glass effect
- `.glass-card` - Glass card component
- `.glass-input` - Glass input fields
- `.glass-button` - Primary button style
- `.glass-button-secondary` - Secondary button style

### Adding New Languages
1. Add translations to `src/i18n/index.ts` in the `resources` object
2. Update language selector in `DashboardLayout.tsx` if needed

## Development

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/layouts/DashboardLayout.tsx`
4. Add translations to `src/i18n/index.ts`

### Adding API Endpoints

1. Add TypeScript types in `src/types/index.ts`
2. Add API method in `src/services/api.ts`
3. Use the API method in your components

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

This project is proprietary software.

## Support

For issues or questions, please contact the development team.
