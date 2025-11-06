# Schema Migration Verification Guide

## How to Verify Your Schema Migrations

You mentioned you ran the schema migrations. Here are **two ways** to verify they were applied correctly:

---

## ✅ Method 1: Quick Column Type Check (Recommended)

**Run this in Supabase SQL Editor:**

Open the file `verify-schema.sql` and run it in your Supabase SQL Editor.

**Expected Output:**
```
column_name  | data_type | udt_name | status
-------------|-----------|----------|----------------
meet_time    | text      | text     | ✅ CORRECT
set_id       | text      | text     | ✅ CORRECT
```

**If you see both as ✅ CORRECT, you're all set!**

---

## ✅ Method 2: Practical Insert Test (More Thorough)

**Run this in Supabase SQL Editor:**

Open the file `test-insert.sql` and run it in your Supabase SQL Editor.

**Expected Output:**
```
NOTICE: Test 1: Inserting plan with TEXT set_id...
NOTICE: ✅ SUCCESS: set_id accepts text values like "cl-2100"
NOTICE: Test 2: Inserting plan with TEXT meet_time...
NOTICE: ✅ SUCCESS: meet_time accepts text values like "9:00 PM"
NOTICE: ════════════════════════════════════════
NOTICE: Test complete! Check results above.
NOTICE: ════════════════════════════════════════
```

This test actually tries to insert data using the exact formats your app will use.

---

## ❌ If Tests Fail

If either test shows errors, you need to run these migrations:

```sql
ALTER TABLE public.plans ALTER COLUMN set_id TYPE text;
ALTER TABLE public.plans ALTER COLUMN meet_time TYPE text;
```

---

## 🎉 After Verification Passes

Once both tests show success, your database is ready! You can:

1. **Test the Add to Schedule feature** in your app
2. Delete these test files:
   - `verify-schema.sql`
   - `test-insert.sql`
   - `SCHEMA-VERIFICATION.md`

---

## What These Migrations Fixed

- **set_id**: Changed from `uuid` → `text` so it can store artist IDs like `"cl-2100"`
- **meet_time**: Changed from `timestamp with time zone` → `text` so it can store times like `"9:00 PM"`

These changes align the database schema with how the app actually uses these fields.
