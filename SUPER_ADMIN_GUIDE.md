# Super Admin Management Guide

This guide explains how to use the new Super Admin functionality for managing users, institutions, and companies in the CEMSE platform.

## Overview

The Super Admin has access to three main management areas:

1. **Youth Users Management** (`/admin/users`)
2. **Institutions Management** (`/admin/institutions`) 
3. **Companies Management** (`/admin/companies`)

## Access Requirements

- User must have `SUPERADMIN` role
- Must be authenticated and active

## Features

### 1. Youth Users Management (`/admin/users`)

**Purpose**: Create, edit, and delete youth users in the system.

**Features**:
- View all youth users with search functionality
- Create new youth users with basic profile information
- Edit existing user information
- Activate/deactivate users
- Delete users (with confirmation)

**Form Fields for Creating Users**:
- Email (required)
- Password (required)
- First Name
- Last Name
- Phone
- Address
- City
- State/Department
- Birth Date
- Gender
- Education Level

**API Endpoints**:
- `GET /api/admin/users?role=YOUTH` - List youth users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### 2. Institutions Management (`/admin/institutions`)

**Purpose**: Create, edit, and delete institutions in the system.

**Features**:
- View all institutions with search functionality
- Create new institutions with complete information
- Edit existing institution details
- Activate/deactivate institutions
- Delete institutions (with confirmation)

**Form Fields for Creating Institutions**:
- Institution Name (required)
- Email (required)
- Password (required)
- Phone
- Address
- Website
- Department (required)
- Region
- Population
- Institution Type (required): Municipality, NGO, Training Center, Foundation, Other
- Custom Type (if "Other" is selected)
- Mayor/Director Name
- Mayor/Director Email
- Mayor/Director Phone
- Primary Color
- Secondary Color

**API Endpoints**:
- `GET /api/admin/institutions` - List institutions
- `POST /api/admin/institutions` - Create new institution
- `PUT /api/admin/institutions/[id]` - Update institution
- `DELETE /api/admin/institutions/[id]` - Delete institution

### 3. Companies Management (`/admin/companies`)

**Purpose**: Create, edit, and delete companies in the system.

**Features**:
- View all companies with search functionality
- Create new companies with business information
- Edit existing company details
- Activate/deactivate companies
- Delete companies (with confirmation)
- Associate companies with institutions

**Form Fields for Creating Companies**:
- Company Name (required)
- Description
- NIT/RUC
- Legal Representative
- Business Sector
- Company Size: Micro, Small, Medium, Large
- Website
- Email
- Phone
- Address
- Founded Year
- Associated Institution (optional)

**API Endpoints**:
- `GET /api/admin/companies` - List companies
- `POST /api/admin/companies` - Create new company
- `PUT /api/admin/companies/[id]` - Update company
- `DELETE /api/admin/companies/[id]` - Delete company

## Navigation

### Main Admin Dashboard
Access the main admin dashboard at `/admin` to see:
- System overview and statistics
- Quick access to all management areas
- Recent activity and system health

### Direct Access
- Youth Users: `/admin/users`
- Institutions: `/admin/institutions`
- Companies: `/admin/companies`

## Security Features

1. **Role-based Access Control**: Only users with `SUPERADMIN` role can access these features
2. **Authentication Required**: All endpoints require valid authentication
3. **Input Validation**: All forms include client and server-side validation
4. **Confirmation Dialogs**: Delete operations require confirmation
5. **Audit Trail**: All operations are logged with creator information

## User Experience Features

1. **Search Functionality**: All management pages include search by relevant fields
2. **Responsive Design**: Works on desktop and mobile devices
3. **Loading States**: Shows loading indicators during operations
4. **Error Handling**: Displays user-friendly error messages
5. **Success Notifications**: Toast notifications for successful operations
6. **Form Validation**: Real-time validation with helpful error messages

## Data Relationships

### User Creation
When creating a youth user:
1. A `User` record is created with basic authentication info
2. A `Profile` record is created with extended information
3. The user can immediately log in with the provided credentials
4. Profile completion is set to 20% (basic info provided)

### Institution Creation
When creating an institution:
1. An `Institution` record is created with all provided information
2. The institution can log in with the provided credentials
3. The institution is marked as active by default
4. The creator (super admin) is recorded for audit purposes

### Company Creation
When creating a company:
1. A `Company` record is created with business information
2. The company can be associated with an institution (optional)
3. The company is marked as active by default
4. The creator (super admin) is recorded for audit purposes

## Best Practices

1. **Password Security**: Use strong passwords when creating new users/institutions
2. **Data Validation**: Always verify information before creating entities
3. **Regular Audits**: Periodically review created entities for accuracy
4. **Backup Considerations**: Consider data backup before bulk operations
5. **User Communication**: Inform users of their new credentials securely

## Troubleshooting

### Common Issues

1. **"Email already exists"**: The email is already in use by another user/institution
2. **"Forbidden"**: User doesn't have SUPERADMIN role
3. **"Unauthorized"**: User is not authenticated
4. **"User not found"**: Trying to edit/delete a non-existent entity

### Error Handling
All errors are displayed as toast notifications with descriptive messages. Check the browser console for detailed error information if needed.

## Future Enhancements

Potential improvements for future versions:
1. Bulk import/export functionality
2. Advanced filtering and sorting options
3. User activity logs and audit trails
4. Email notifications for new account creation
5. Role assignment for institutions and companies
6. Advanced search with multiple criteria

