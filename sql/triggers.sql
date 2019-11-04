DELIMITER //
CREATE TRIGGER get_id_created_account
after insert ON COMPTES
for each row
BEGIN
        declare id integer;
        SELECT IDCOMPTE into id FROM COMPTES WHERE PRENOMCOMPTE = new.PRENOMCOMPTE and NOMCOMPTE = new.NOMCOMPTE;
        signal sqlstate '45000' set message_text = id;
end //
DELIMITER ;