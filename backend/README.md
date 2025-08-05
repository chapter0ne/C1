# ChapterOne Unified Backend

## Suggested Directory Structure

```
backend/
  |-- models/         # Mongoose schemas (User, Book, etc.)
  |-- routes/         # Express route handlers (auth, books, users, etc.)
  |-- controllers/    # (Optional) Route logic separated from routes
  |-- middleware/     # Auth, role checks, error handling
  |-- utils/          # Helper functions (e.g., email, validation)
  |-- index.js        # Entry point (Express app)
  |-- .env            # Environment variables
  |-- README.md       # This file
```

- **models/**: All MongoDB schemas
- **routes/**: All API endpoints
- **controllers/**: (Optional) Business logic for routes
- **middleware/**: Auth, role, error handling, etc.
- **utils/**: Utility functions
- **index.js**: Main server file

This structure supports both admin and user-facing features, with role-based access control. 