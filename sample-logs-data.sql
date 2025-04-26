-- Insert sample keystroke logs
INSERT INTO keystroke_logs (id, user_id, application, window_title, keys, timestamp)
VALUES 
  (gen_random_uuid(), (SELECT id FROM profiles LIMIT 1), 'Microsoft Word', 'Document1.docx', 'Hello world, this is a test document', NOW()),
  (gen_random_uuid(), (SELECT id FROM profiles LIMIT 1), 'Google Chrome', 'Gmail - Inbox', 'Dear team, Please find attached the report', NOW() - INTERVAL '5 minutes'),
  (gen_random_uuid(), (SELECT id FROM profiles LIMIT 1), 'Visual Studio Code', 'project.js', 'function calculateTotal() { return items.reduce((sum, item) => sum + item.price, 0); }', NOW() - INTERVAL '15 minutes'),
  (gen_random_uuid(), (SELECT id FROM profiles LIMIT 1), 'Slack', 'general', 'I will be joining the meeting in 5 minutes', NOW() - INTERVAL '30 minutes'),
  (gen_random_uuid(), (SELECT id FROM profiles LIMIT 1), 'Terminal', 'bash', 'git commit -m "Fix authentication bug"', NOW() - INTERVAL '1 hour'),
  (gen_random_uuid(), (SELECT id FROM profiles LIMIT 1), 'Outlook', 'Meeting Invitation', 'Yes, I will attend the meeting tomorrow', NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), (SELECT id FROM profiles LIMIT 1), 'Notepad', 'passwords.txt', 'mySecretPassword123', NOW() - INTERVAL '3 hours'),
  (gen_random_uuid(), (SELECT id FROM profiles LIMIT 1), 'Excel', 'Financial Report Q2.xlsx', '=SUM(A1:A10)', NOW() - INTERVAL '4 hours'),
  (gen_random_uuid(), (SELECT id FROM profiles LIMIT 1), 'PowerPoint', 'Company Presentation.pptx', 'Tracklify: Real-time Insight. Total Control. Ethically Engineered.', NOW() - INTERVAL '5 hours'),
  (gen_random_uuid(), (SELECT id FROM profiles LIMIT 1), 'FileZilla', 'FTP Connection', 'Uploading confidential files to server', NOW() - INTERVAL '6 hours');
