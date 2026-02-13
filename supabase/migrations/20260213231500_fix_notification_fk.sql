-- Ensure foreign key constraint exists for user_notifications -> announcements
alter table user_notifications
add constraint user_notifications_announcement_fk
foreign key (announcement_id)
references announcements(id)
on delete cascade;
