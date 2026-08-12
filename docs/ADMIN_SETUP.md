# Administrator Account Setup

SVS English Coach does **not** ship with a hardcoded admin account. Credentials
must be created through Lovable Cloud (Supabase) and the `admin` role assigned
manually. Follow this one-time setup after deploying.

## 1. Create the admin user

In the Lovable Cloud dashboard:

1. Open **Backend → Authentication → Users**.
2. Click **Add user**.
3. Enter the administrator's email address and a strong initial password.
4. Confirm the user (or send an invite email — the account must be confirmed
   before it can sign in).

> Store the initial password in a password manager and rotate it after the
> administrator's first sign-in. Never commit credentials to the repository.

## 2. Grant the `admin` role

Run the following SQL in **Backend → SQL Editor**, replacing the email:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'admin@svshighschool.edu'
ON CONFLICT (user_id, role) DO NOTHING;
```

The admin login page verifies this role assignment; users without the `admin`
role are signed out immediately even if their password is correct.

## 3. Sign in

Navigate to `/admin/login` and sign in with the credentials created in step 1.

## Roles reference

The `public.app_role` enum contains:

| Role            | Purpose                                  |
| --------------- | ---------------------------------------- |
| `admin`         | Full administrative access               |
| `teacher`       | Teaching staff                           |
| `receptionist`  | Front desk / reception staff             |
| `office_staff`  | Office administration staff              |
| `support_staff` | Support / auxiliary staff                |

Assign additional roles with the same `INSERT` pattern, changing the role
value. Only administrators can modify `public.user_roles` from the app.

## Password resets

Administrators use the same **Forgot password** flow as other users. The
reset link is delivered by Lovable Cloud email and returns the user to
`/reset-password` to set a new password.
