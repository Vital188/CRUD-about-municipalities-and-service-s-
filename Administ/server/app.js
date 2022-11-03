const express = require("express");
const app = express();
const port = 3003;
app.use(express.json({ limit: '20mb' }));
const cors = require("cors");
app.use(cors());
const md5 = require('js-md5');
const uuid = require('uuid');
const mysql = require("mysql");
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());


const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "admin",
});

////////////////////LOGIN/////////////////

const doAuth = function(req, res, next) {
    if (0 === req.url.indexOf('/server')) { // admin
        const sql = `
        SELECT
        name, role
        FROM users
        WHERE session = ?
    `;
        con.query(
            sql, [req.headers['authorization'] || ''],
            (err, results) => {
                if (err) throw err;
                if (!results.length || results[0].role !== 10) {
                    res.status(401).send({});
                    req.connection.destroy();
                } else {
                    next();
                }
            }
        );
    } else if (0 === req.url.indexOf('/login-check') || 0 === req.url.indexOf('/login') || 0 === req.url.indexOf('/register')) {
        next();
    } else { // fron
        const sql = `
        SELECT
        name, role
        FROM users
        WHERE session = ?
    `;
        con.query(
            sql, [req.headers['authorization'] || ''],
            (err, results) => {
                if (err) throw err;
                if (!results.length) {
                    res.status(401).send({});
                    req.connection.destroy();
                } else {
                    next();
                }
            }
        );
    }
}

app.use(doAuth);

// AUTH
app.get("/login-check", (req, res) => {
    const sql = `
         SELECT
         name, role
         FROM users
         WHERE session = ?
        `;
    con.query(sql, [req.headers['authorization'] || ''], (err, result) => {
        if (err) throw err;
        if (!result.length) {
            res.send({ msg: 'error', status: 1 }); // user not logged
        } else {
            if ('admin' === req.query.role) {
                if (result[0].role !== 10) {
                    res.send({ msg: 'error', status: 2 }); // not an admin
                } else {
                    res.send({ msg: 'ok', status: 3 }); // is admin
                }
            } else {
                res.send({ msg: 'ok', status: 4 }); // is user
            }
        }
    });
});

app.post("/login", (req, res) => {
    const key = uuid.v4();
    const sql = `
    UPDATE users
    SET session = ?
    WHERE name = ? AND psw = ?
  `;
    con.query(sql, [key, req.body.user, md5(req.body.pass)], (err, result) => {
        if (err) throw err;
        if (!result.affectedRows) {
            res.status(401).send({ msg: 'error', key: '' });
        } else {
            res.send({ msg: 'ok', key, text: 'Good to see you ' + req.body.user + ' again.', type: 'info' });
        }
    });
});

app.post("/register", (req, res) => {
    const key = uuid.v4();
    const sql = `
    INSERT INTO users (name, psw, session)
    VALUES (?, ?, ?)
  `;
    con.query(sql, [req.body.name, md5(req.body.pass), key], (err, result) => {
        if (err) throw err;
        res.send({ msg: 'ok', key, text: 'Welcome!', type: 'info' });
    });
});

///////////////////END////////////////////


//CREATE
app.post("/server/regionai", (req, res) => {
    const sql = `
    INSERT INTO regionai (region, image)
    VALUES (?, ?)
    `;
    con.query(sql, [req.body.region,  req.body.image], (err, result) => {
        if (err) throw err;
        res.send({ msg: 'OK', text: 'New municipality was added.', type: 'success' });
    });
});

 app.post("/server/field", (req, res) => {
     const sql = `
     INSERT INTO field (title, image2)
     VALUES (?, ?)
     `;
     con.query(sql, [req.body.title, req.body.image2], (err, result) => {
         if (err) throw err;
         res.send({ msg: 'OK', text: 'New services was added.', type: 'success' });
     });
 });


app.post("/home/comments/:id", (req, res) => {
    const sql = `
    INSERT INTO comments (post, regionai_id, field_id, image, image2, region, title)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    con.query(sql, [req.body.post, req.params.id, req.body.field_id, req.body.image, req.body.image2, req.body.region, req.body.title], (err, result) => {
        if (err) throw err;
        res.send({ msg: 'OK', text: 'Thanks, for commenting.', type: 'info' });
    });
});

// READ (all)
app.get("/server/regionai", (req, res) => {
    const sql = `
    SELECT id, region, image
    FROM regionai
    ORDER BY id DESC
    `;
    con.query(sql,  (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.get("/server/field", (req, res) => {
    const sql = `
    SELECT id, title, image2
    FROM field
    ORDER BY id DESC
    `;
    con.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});


app.get("/home/regionai", (req, res) => {
    const sql = `
    SELECT *
    FROM regionai 
    `;
    con.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.get("/home/field", (req, res) => {
    const sql = `
    SELECT id, title, image2
    FROM field
    ORDER BY id DESC
    `;
    con.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});



app.get("/home/regionai/wc", (req, res) => {
    const sql = `
    SELECT r.*, c.id AS cid, c.post
    FROM regionai AS r
    INNER JOIN comments AS c
    ON c.regionai_id = r.id
    ORDER BY r.region
    `;
    con.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.get("/home/comments/wc", (req, res) => {
    const sql = `
    SELECT c.*, r.id AS rid, f.id AS fid, f.title, f.image2 
    FROM comments AS c
    INNER JOIN regionai AS r
    ON c.regionai_id = r.id
    INNER JOIN field AS f
    ON c.field_id = f.id
    ORDER BY c.post
    `;
    con.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});
// FROM comments AS c
//     INNER JOIN field AS f
//     ON c.field_id = fid
//     ORDER BY c.post



//DELETE
app.delete("/server/regionai/:id", (req, res) => {
    const sql = `
    DELETE FROM regionai
    WHERE id = ?
    `;
    con.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.send({ msg: 'OK', text: 'The municipality was deleted.', type: 'info' });
    });
});

app.delete("/server/field/:id", (req, res) => {
    const sql = `
    DELETE FROM field
    WHERE id = ?
    `;
    con.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.send({ msg: 'OK', text: 'The service was deleted.', type: 'info' });
    });
});

app.delete("/server/comments/:id", (req, res) => {
    const sql = `
    DELETE FROM comments
    WHERE id = ?
    `;
    con.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.send({ msg: 'OK', text: 'Bad comment was deleted.', type: 'info' });
    });
});


//EDIT
// app.put("/home/regionai/:id", (req, res) => {
//     const sql = `
//     UPDATE regionai
//     SET 
//     rating_sum = rating_sum + ?, 
//     rating_count = rating_count + 1, 
//     rating = rating_sum / rating_count
//     WHERE id = ?
//     `;
//     con.query(sql, [req.body.rate, req.params.id], (err, result) => {
//         if (err) throw err;
//         res.send({ msg: 'OK', text: 'Thanks, for your vote.', type: 'info' });
//     });
// });
app.put("/server/regionai/:id", (req, res) => {
    let sql;
    let r;
    if (req.body.deletePhoto) {
        sql = `
        UPDATE regionai
        SET region = ?, image = null
        WHERE id = ?
        `;
        r = [req.body.region, req.params.id];
    } else if (req.body.image) {
        sql = `
        UPDATE regionai
        SET region = ?, image = ?
        WHERE id = ?
        `;
        r = [req.body.region, req.body.image, req.params.id];
    }
     else {
        sql = `
        UPDATE regionai
        SET region = ?, 
        WHERE id = ?
        `;
        r = [req.body.region, req.params.id]
    }
    con.query(sql, r, (err, result) => {
        if (err) throw err;
        res.send({ msg: 'OK', text: 'The region and field was edited.', type: 'success' });
    });
});

app.put("/server/field/:id", (req, res) => {
    let sql;
    let f;
    if (req.body.deletePhoto) {
        sql = `
        UPDATE field
        SET title = ?, image2 = null
        WHERE id = ?
        `;
        f = [req.body.title, req.params.id];
    } else if (req.body.image2) {
        sql = `
        UPDATE field
        SET title = ?, image2 = ?
        WHERE id = ?
        `;
        f = [req.body.title, req.body.image2, req.params.id];
    } else {
        sql = `
        UPDATE field
        SET title = ? 
        WHERE id = ?
        `;
        f = [req.body.title, req.params.id]
    }
    con.query(sql, f, (err, result) => {
        if (err) throw err;
        res.send({ msg: 'OK', text: 'The service was edited.', type: 'success' });
    });
});



app.listen(port, () => {
    console.log(`Administration portala rodo per ${port} portą!`)
});






// // READ
// // SELECT column1, column2, ...
// // FROM table_name;

// // app.get("/trees/:tipas", (req, res) => {

// //     // console.log(req.query.sort);

// //     const sql = `
// //     SELECT id, type, title, height
// //     FROM trees
// //     WHERE type = ? OR type = ?
// //     `;
// //     con.query(sql, [req.params.tipas, req.query.sort], (err, result) => {
// //         if (err) throw err;
// //         res.send(result);
// //     });
// // });

// // INNER JOIN
// // SELECT column_name(s)
// // FROM table1
// // INNER JOIN table2
// // ON table1.column_name = table2.column_name;
// app.get("/get-it/inner-join", (req, res) => {
//     const sql = `
//     SELECT c.id, p.id AS pid, name, phone
//     FROM clients AS c
//     INNER JOIN phones AS p
//     ON c.id = p.client_id
//     `;
//     con.query(sql, (err, result) => {
//         if (err) throw err;
//         res.send(result);
//     });
// });

// app.get("/get-it/left-join", (req, res) => {
//     const sql = `
//     SELECT c.id, p.id AS pid, name, phone
//     FROM clients AS c
//     LEFT JOIN phones AS p
//     ON c.id = p.client_id
//     `;
//     con.query(sql, (err, result) => {
//         if (err) throw err;
//         res.send(result);
//     });
// });

// app.get("/get-it/right-join", (req, res) => {
//     const sql = `
//     SELECT c.id, p.id AS pid, name, phone
//     FROM clients AS c
//     RIGHT JOIN phones AS p
//     ON c.id = p.client_id
//     `;
//     con.query(sql, (err, result) => {
//         if (err) throw err;
//         res.send(result);
//     });
// });





// // READ (all)
// app.get("/trees", (req, res) => {
//     const sql = `
//     SELECT id, type, title, height
//     FROM trees
//     `;
//     con.query(sql, (err, result) => {
//         if (err) throw err;
//         res.send(result);
//     });
// });

// //CREATE
// // INSERT INTO table_name (column1, column2, column3, ...)
// // VALUES (value1, value2, value3, ...);
// app.post("/trees", (req, res) => {
//     const sql = `
//     INSERT INTO trees (title, height, type)
//     VALUES (?, ?, ?)
//     `;
//     con.query(sql, [req.body.title, req.body.height, req.body.type], (err, result) => {
//         if (err) throw err;
//         res.send(result);
//     });
// });


// //DELETE
// // DELETE FROM table_name WHERE condition;
// app.delete("/trees/:id", (req, res) => {
//     const sql = `
//     DELETE FROM trees
//     WHERE id = ?
//     `;
//     con.query(sql, [req.params.id], (err, result) => {
//         if (err) throw err;
//         res.send(result);
//     });
// });


// //EDIT
// // UPDATE table_name
// // SET column1 = value1, column2 = value2, ...
// // WHERE condition;
// app.put("/trees/:id", (req, res) => {
//     const sql = `
//     UPDATE trees
//     SET title = ?, height = ?, type = ?
//     WHERE id = ?
//     `;
//     con.query(sql, [req.body.title, req.body.height, req.body.type, req.params.id], (err, result) => {
//         if (err) throw err;
//         res.send(result);
//     });
// });