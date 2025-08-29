# Backend API Specifications for Payment Processing

## Overview
This document outlines the backend API endpoints required to support the Paystack payment integration for the reading app.

## Payment Processing Endpoint

### POST /cart/process-payment

**Purpose**: Process successful payments and grant users lifetime access to purchased books.

**Request Body**:
```json
{
  "reference": "string",           // Paystack transaction reference
  "bookIds": ["string"],          // Array of purchased book IDs
  "userId": "string",             // User ID who made the purchase
  "amount": "number",             // Payment amount in NGN
  "paystackData": {               // Full Paystack verification response
    "reference": "string",
    "amount": "number",
    "status": "string",
    "gateway_response": "string",
    "paid_at": "string",
    "metadata": {
      "bookIds": ["string"],
      "userId": "string"
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "purchasedBooks": ["string"],  // Array of book IDs that were processed
    "totalAmount": "number",       // Total amount processed
    "userId": "string"            // User ID
  }
}
```

## Database Schema Updates

### 1. User Purchases Table
```sql
CREATE TABLE user_purchases (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  book_id VARCHAR(255) NOT NULL,
  paystack_reference VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
);
```

### 2. Update Book Access Logic
```sql
-- Check if user has access to a book (free OR purchased)
SELECT 
  CASE 
    WHEN b.is_free = true THEN true
    WHEN up.user_id IS NOT NULL THEN true
    ELSE false
  END as has_access
FROM books b
LEFT JOIN user_purchases up ON b.id = up.book_id AND up.user_id = $1
WHERE b.id = $2;
```

## Implementation Requirements

### 1. Payment Verification
- Verify Paystack transaction reference
- Check transaction status is 'success'
- Validate amount matches expected total
- Ensure bookIds and userId match metadata

### 2. Access Control
- Once a book is purchased, user has lifetime access
- Purchased books behave like free books for library management
- Users can add/remove purchased books from library freely
- Access persists even after removing from library

### 3. Security Measures
- Validate Paystack webhook signature (if using webhooks)
- Store transaction reference to prevent duplicate processing
- Log all payment activities for audit trail
- Implement rate limiting on payment endpoints

### 4. Error Handling
- Handle Paystack API failures gracefully
- Provide clear error messages for failed payments
- Implement retry logic for transient failures
- Rollback database changes on payment failures

## Webhook Support (Optional)

### POST /webhooks/paystack
Handle Paystack webhooks for real-time payment updates:

```json
{
  "event": "charge.success",
  "data": {
    "reference": "string",
    "amount": "number",
    "status": "string",
    "metadata": {
      "bookIds": ["string"],
      "userId": "string"
    }
  }
}
```

## Testing

### Test Cases
1. **Successful Payment**: Verify books are added to user's purchased list
2. **Duplicate Payment**: Prevent processing same reference twice
3. **Invalid Reference**: Handle non-existent transaction references
4. **Amount Mismatch**: Validate payment amount matches cart total
5. **User Access**: Confirm purchased books are accessible immediately

### Test Data
- Use Paystack test keys for development
- Test with various payment amounts
- Verify callback URL handling
- Test error scenarios and edge cases

## Monitoring & Analytics

### Metrics to Track
- Payment success rate
- Average transaction value
- Most purchased books
- User conversion rate (cart to purchase)
- Payment method preferences

### Logging
- Log all payment attempts (success/failure)
- Track payment processing time
- Monitor API response times
- Alert on payment failures

## Deployment Notes

### Environment Variables
```
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_WEBHOOK_SECRET=whsec_...
```

### Security Considerations
- Never expose secret keys in frontend code
- Use HTTPS for all payment endpoints
- Implement proper authentication/authorization
- Validate all input data
- Rate limit payment endpoints
- Monitor for suspicious activity
