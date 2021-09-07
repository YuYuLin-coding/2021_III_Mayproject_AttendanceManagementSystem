var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");

var db = require('./db')
var { Success, Error } = require('./response')
var app = express();
app.listen(3000);
console.log("server starting")
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(__dirname + '/public'))
app.set("view engine", "ejs")
app.use(bodyParser.json());
app.use(session({
    secret: "Pa$$w0rd",
    resave: true,
    saveUninitialized: true
}))
var mysql = require("mysql"); // npm install mysql
var conn = mysql.createConnection({
    user: "usertest",
    password: "0000",
    host: "localhost",
    port: 8889,  // Mac 8889 or Window 3306 
    database: "jobDB"
});
conn.connect(function (error) {
    if (error) {
        console.log(error);
    }
    else {
        console.log("jobDB Connected");
    }
})

app.get('/', function (req, res) {
    var who = req.session.accNum || "Guest";
    var accNum = req.session.accNum
    res.render("login", { accNum: who, WrongMSG: '' });
})
app.post("/", function (req, res) {
    if (req.body.accNum == "") {
        // console.log(req.body.accNum);
        res.render("login", { WrongMSG: '請輸入帳號' });
        return;
    }
    var accNum = req.body.accNum;
    var paWord = req.body.paWord;
    conn.query("select WorkPassword from table1 where WorkId = ? and WorkPassword =? ",
        [accNum, paWord],
        function (error, result) {
            if (result == "") {
                res.render("login", { WrongMSG: '帳號或密碼錯誤' });
                return;
            }
            req.session.accNum = req.body.accNum;
            var who = req.session.accNum
            res.redirect("index")
        })

})
app.get("/index", function (req, res) {
    var accNum = req.session.accNum || "Guest";
    if (accNum == "Guest") {
        res.redirect("/");
        return;
    }
    var who = req.session.accNum
    res.render("index", { accNum: who });
})
app.get("/leaveApply", function (req, res) {
    var accNum = req.session.accNum || "Guest";
    if (accNum == "Guest") {
        res.redirect("/");
        return;
    }
    var who = req.session.accNum
    db.exec(`SELECT * FROM TABLE3 where WorkId = ? ;`, [accNum], function (data, fields) {
        db.exec(`SELECT * FROM TABLE4 where WorkId = ?;`, [accNum], function (leaveRecord, fields) {
            console.log(data)
            res.render("leaveApply", {
                accNum: who,
                data: data,
                leaveRecord: leaveRecord,
                //本頁資料數量
            })
        })
    })
})
app.get("/leaveApplyRecord", function (req, res) {
    var accNum = req.session.accNum || "Guest";
    if (accNum == "Guest") {
        res.redirect("/");
        return;
    }
    var who = req.session.accNum
    db.exec(`SELECT * FROM TABLE4 where WorkId = ? order by applyDate desc;`, [accNum], function (data, fields) {
        res.render("leaveApplyRecord", { accNum: who, data: data });
    })
})
app.get("/overTimeApply", function (req, res) {
    var accNum = req.session.accNum || "Guest";
    if (accNum == "Guest") {
        res.redirect("/");
        return;
    }
    var who = req.session.accNum
    res.render("overTimeApply", { accNum: who });
})
app.get("/overTimeApplyRecord", function (req, res) {
    var accNum = req.session.accNum || "Guest";
    if (accNum == "Guest") {
        res.redirect("/");
        return;
    }
    var who = req.session.accNum
    res.render("overTimeApplyRecord", { accNum: who });
})
app.get("/personalInformation", function (req, res) {
    var accNum = req.session.accNum || "Guest";
    if (accNum == "Guest") {
        res.redirect("/");
        return;
    }
    conn.query("select * from TABLE1 where WorkId = ? ",
        [accNum],
        function (error, result) {
            var rs = Object.values(result[0]);

            var who = req.session.accNum
            var WorkId = rs[1];
            var Name = rs[3];
            var PersonalId = rs[4];
            var Phone = rs[5];
            var CellPhone = rs[6];
            var Address = rs[7];
            var WorkStartDay = rs[8];
            var Sex = rs[9];
            var Blood = rs[10];
            var Allergy = rs[11];
            var EmergencyContactPerson = rs[12];
            var EmergencyContactRelationship = rs[13];
            var EmergencyContactPhone = rs[14];
            res.render("personalInformation",
                {
                    accNum: who, WorkId: WorkId, Name: Name, PersonalId: PersonalId,
                    Phone: Phone, CellPhone: CellPhone, Address: Address, WorkStartDay: WorkStartDay,
                    Sex: Sex, Blood: Blood, Allergy: Allergy, EmergencyContactPerson: EmergencyContactPerson,
                    EmergencyContactPhone: EmergencyContactPhone, EmergencyContactRelationship: EmergencyContactRelationship
                });
        })
})
app.get("/personalWorkRecord", function (req, res) {
    var accNum = req.session.accNum || "Guest";
    if (accNum == "Guest") {
        res.redirect("/");
        return;
    }
    var who = req.session.accNum
    res.redirect("/personalWorkRecord9999");
    return;
})
app.get("/personalWorkRecord:page([0-9]+)", function (req, res) {
    var accNum = req.session.accNum || "Guest";
    if (accNum == "Guest") {
        res.redirect("/");
        return;
    }
    var page = req.params.page
    //把<=0的id強制改成1
    if (page <= 0) {
        res.redirect('/personalWorkRecord1')
        return
    }
    //每頁資料數
    var nums_per_page = 7
    //定義資料偏移量
    var offset = (page - 1) * nums_per_page
    var who = req.session.accNum
    db.exec(`SELECT * FROM TABLE2 where WorkId = ? LIMIT ${offset}, ${nums_per_page} ;`, [accNum], function (data, fields) {
        db.exec(`SELECT distinct Week000 FROM TABLE2 where WorkId = ?;`, [accNum], function (Weekpage, fields) {
            db.exec(`SELECT COUNT(*) AS COUNT FROM TABLE2 where WorkId = ?`, [accNum], function (nums, fields) {
                var last_page = Math.ceil(nums[0].COUNT / nums_per_page)
                //避免請求超過最大頁數
                if (page > last_page) {
                    res.redirect('/personalWorkRecord' + last_page)
                    return
                }
                res.render("personalWorkRecord", {
                    accNum: who,
                    data: data,
                    curr_page: page,
                    Weekpage: Weekpage,
                    //本頁資料數量
                    total_nums: nums[0].COUNT,
                    //總數除以每頁筆數，再無條件取整數
                    last_page: last_page
                })
            })
        })
    })
})
app.get("/quitApply", function (req, res) {
    var accNum = req.session.accNum || "Guest";
    if (accNum == "Guest") {
        res.redirect("/");
        return;
    }
    var who = req.session.accNum
    res.render("quitApply", { accNum: who });
})
app.get("/salary", function (req, res) {
    var accNum = req.session.accNum || "Guest";
    if (accNum == "Guest") {
        res.redirect("/");
        return;
    }
    var who = req.session.accNum
    res.render("salary", { accNum: who });
})
app.get("/logout", function (req, res) {
    delete req.session.accNum;
    res.redirect("/");
})
app.post("/update", function (req, res) {
    var body = req.body;
    console.log(req.body);

    var sql = `UPDATE TABLE1 SET Phone = ?, CellPhone = ?, Address = ?, Allergy = ?, EmergencyContactPerson = ? , EmergencyContactRelationship = ?, EmergencyContactPhone = ? where WorkId= ?`;
    var data = [body.Phone, body.CellPhone, body.Address, body.Allergy, body.EmergencyContactPerson, body.EmergencyContactRelationship, body.EmergencyContactPhone, body.WorkId]
    db.exec(sql, data, function (results, fields) {
        if (results.affectedRows) {
            res.end(
                JSON.stringify(new Success('update success'))
            )
        } else {
            res.end(
                JSON.stringify(new Error('update failed'))
            )
        }
    })
})
app.post('/add', function (req, res) {
    var accNum = req.session.accNum || "Guest";
    if (accNum == "Guest") {
        res.redirect("/");
        return;
    }
    var body = req.body
    var sql = `INSERT INTO table4(WorkId, applyDate, leaveType, leaveDate, leaveUse, ListStatus) VALUES(?,?,?,?,?,?);`
    var data = [accNum, body.applyDate, body.leaveType, body.leaveDate, body.leaveUse, '簽核中']
    console.log(body.holiType, body.leaveTypeUse, accNum)
    db.exec(`UPDATE TABLE3 SET ${body.holiType} = ?  where WorkId= ?;`,
        [body.leaveTypeUse, accNum], function (renew, fields) {
            db.exec(sql, data, function (results, fields) {
                if (results) {
                    res.end(
                        JSON.stringify(new Success('insert success'))
                    )
                } else {
                    res.end(
                        JSON.stringify(new Error('insert failed'))
                    )
                }
            })
        })
})