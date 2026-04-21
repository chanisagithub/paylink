alter table public.payments
drop constraint if exists payments_link_id_fkey;

alter table public.payments
add constraint payments_link_id_fkey
foreign key (link_id)
references public.payment_links (id)
on delete restrict;

