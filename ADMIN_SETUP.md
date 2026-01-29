# Admin Access Protocol

To access the **ChuMail Admin Command Center**, you must have administrative privileges assigned to your profile.

### 1. Elevate Role to Admin

Run the following command in your terminal to grant yourself admin rights:

```bash
# Replace 'your_email' with the email you used to sign up
psql $DATABASE_URL -c "UPDATE profiles SET role = 'admin' WHERE email = 'your_email';"
```

### 2. Verification

1.  **Log Out**: Perform a clean logout from the dashboard.
2.  **Log In**: Sign back in to refresh your session data.
3.  **Command Center**: The **"Admin Board"** link will now be visible in your sidebar.

---
*ChuMail Security Protocol // Authorized Personnel Only*
