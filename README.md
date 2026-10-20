# Ecotera Asia file updates

This package contains the 10 HTML files retrievable from the referenced conversation and a welcome-email draft. account.html was not returned by attachment retrieval and is not included. Keep your existing account.html; it has not been modified or verified here.

Before using signup confirmation or password reset, fill in LOGIN_REDIRECT_URL and PASSWORD_RESET_REDIRECT_URL in login.html with the confirmed absolute Asia site URLs, and allow them in Asia Supabase Auth settings. These are intentionally blank with TODO comments because no Asia GitHub Pages URL was present in the retrieved files.

The existing Asia URL and publishable key were verified to match across index.html, admin.html and practice.html, and copied into the seven remaining pages. The field-data bucket, field_data table and file_path column mappings were updated. Admin uses sample-images. Only the visible homepage brand text was changed. practice.html now includes bottom navigation; its application logic is unchanged. After inspecting the exported backend functions, new-sample.html now also uploads directly to sample-images because check_kit_v2 does not return storage_bucket. RPC names and kit validation logic are unchanged. Field Data WebP compression is preserved.

Validation: inline JavaScript was syntax-checked. The pre-existing invalid multiline error-message string in my-samples.html has been repaired during the navigation update. Legacy Home Supabase credentials and old field-data/admin bucket references are absent. No live authentication, uploads, database operations or email sending were performed. The exported New Sample RPC definitions have now been inspected. save_sample_with_kit still inserts into ecotera_asia_intern_bucket_001_samples; migration to samples remains pending inspection of table columns and triggers. create_kit does not explicitly generate manual_code; its column default and triggers remain to be checked.

Navigation update: duplicate top links removed, bottom navigation added to main pages, New Sample help dialog added, and a starter Learn page created. See the navigation update package for details.
