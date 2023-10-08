const verifyToken = require('../middlewaer/vetToken')
const fs = require('fs');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

function promotionRouter(app, connection) {
    app.get('/promotions', (req, res) => {
        connection.query('SELECT * FROM promotions', (err, result) => {
            if (err) {
                console.error('Error fetching data:', err);
                res.status(500).json({ error: 'Failed to fetch data' });
                return;
            }

            // Convert LONGBLOB to Base64
            result.forEach((row) => {
                if (row.img instanceof Buffer) {
                    row.img = row.img.toString('base64');
                }
            });

            res.json(result);
        });
    });


    app.get('/promotion', verifyToken, (req, res) => {
        const userId = req.userId;

        connection.query(
            'SELECT pro_id, createAt, img FROM promotions WHERE ent_id = ?',
            [userId],
            (err, result) => {
                if (err) {
                    console.error('Error fetching data:', err);
                    res.status(500).json({ error: 'Failed to fetch data' });
                    return;
                }

                // Convert LONGBLOB to Base64
                result.forEach((row) => {
                    if (row.img instanceof Buffer) {
                        row.img = row.img.toString('base64');
                    }
                });

                res.json(result);
            }
        );
    });


    app.delete("/promotion/:pro_id", (req, res) => {
        const proID = req.params.pro_id;

        connection.query("DELETE FROM promotions WHERE pro_id = ?", proID, (err) => {
            if (err) throw err;
            res.json({ message: "Promotion deleted successfully" });
        });
    });


    app.post('/upload', verifyToken, (req, res) => {
        // ตรวจสอบว่า client ส่งรูปภาพมาหรือไม่
        if (!req.body.image) {
            res.status(400).json({ error: 'No image provided' });
            return;
        }

        // รับข้อมูลรูปภาพจาก client
        const imgBase64 = req.body.image;

        // เพิ่มข้อมูลรูปภาพลงในฐานข้อมูล
        const insertSql = 'INSERT INTO promotions (img, ent_id) VALUES (?, ?)';
        const values = [Buffer.from(imgBase64, 'base64'), req.userId];

        connection.query(insertSql, values, (err, result) => {
            if (err) {
                console.error('Error inserting image data into database:', err);
                res.status(500).json({ error: 'Failed to insert image data into database' });
                return;
            }

            res.json({ message: 'Image inserted into the database' });
        });
    });

}

module.exports = promotionRouter;
