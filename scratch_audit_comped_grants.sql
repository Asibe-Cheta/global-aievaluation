-- ============ audit: every comped grant ever made ============
select u.email, pu.product_type, pu.status, pu.amount_cents, pu.created_at
from public.purchases pu
join auth.users u on u.id = pu.user_id
where pu.stripe_checkout_session_id like 'manual_grant_%'
order by u.email, pu.product_type;
