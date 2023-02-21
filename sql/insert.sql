INSERT INTO events (id, name, slug, description) VALUES (1, 'Forritarahittingur í febrúar', 'forritarahittingur-i-februar', 'Forritarar hittast í febrúar og forrita saman eitthvað frábært.');
INSERT INTO events (id, name, slug, description) VALUES (2, 'Hönnuðahittingur í mars', 'honnudahittingur-i-mars', 'Spennandi hittingur hönnuða í Hönnunarmars.');
INSERT INTO events (id, name, slug, description) VALUES (3, 'Verkefnastjórahittingur í apríl', 'verkefnastjorahittingur-i-april', 'Virkilega vel verkefnastýrður hittingur.');
INSERT INTO events (id, name, slug, description) VALUES (4, 'Verkefna', 'april', ' hittingur.');
INSERT INTO events (id, name, slug, description) VALUES (5, 'Test1', 'Test1', 'Test1.');
INSERT INTO events (id, name, slug, description) VALUES (6, 'Test2', 'Test2', 'Test2.');
INSERT INTO events (id, name, slug, description) VALUES (7, 'Test3', 'Test3', 'Test3.');
INSERT INTO events (id, name, slug, description) VALUES (8, 'Test4', 'Test4', 'Test4.');
INSERT INTO events (id, name, slug, description) VALUES (9,'Test5', 'Test5', 'Test5');
INSERT INTO events (id, name, slug, description) VALUES (10, 'Test6', 'Test6', 'Test6.');
INSERT INTO events (id, name, slug, description) VALUES (11, 'Test7', 'Test7', 'Test7');

INSERT INTO registrations (name, comment, event) VALUES ('Forvitinn forritari', 'Hlakka til að forrita með ykkur', 1);
INSERT INTO registrations (name, comment, event) VALUES ('Jón Jónsson', null, 1);
INSERT INTO registrations (name, comment, event) VALUES ('Guðrún Guðrúnar', 'verður vefforritað?', 1);

INSERT INTO users (username, password, admin) VALUES ('admin', '$2a$11$pgj3.zySyFOvIQEpD7W6Aund1Tw.BFarXxgLJxLbrzIv/4Nteisii', true);
