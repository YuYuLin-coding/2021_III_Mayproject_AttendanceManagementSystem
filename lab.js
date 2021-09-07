const db = require('./db');
const { Success, Error } = require('./response');
function UPDATE(Phone, CellPhone, Address, Allergy, EmergencyContactPerson,EmergencyContactRelationship,EmergencyContactPhone,WorkId) {
    const sql = `UPDATE TABLE1 SET Phone = ?, CellPhone = ?, Address = ?, Allergy = ?, EmergencyContactPerson = ? , EmergencyContactRelationship = ?, EmergencyContactPhone = ?, where WorkId= ?`;
    const data = [Phone, CellPhone, Address, Allergy, EmergencyContactPerson,EmergencyContactRelationship,EmergencyContactPhone,WorkId];
    db.exec(sql, data, function(results, fields) {
        if(results.affectedRows){
            console.log(JSON.stringify(new Success('update success')));
        } else {
            console.log(JSON.stringify(new Error('update failed')));
        }
    });
}