-- Lets admins attach a proof-of-work screenshot to a testimonial (e.g. a
-- hire confirmation on Mercor/Outlier) separate from the person's profile
-- photo (avatar_url). Reuses the existing testimonial-media bucket/policies.
alter table public.testimonials add column proof_image_url text;
