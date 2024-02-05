import express from "express";
import passport from "passport";
import {check, validationResult} from "express-validator";
import {calcHash, generateSalt} from "../util/auth.js";
import {PrismaClient} from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/* GET users listing. */
/*
* 状態確認
*/
router.get('/', function (req, res, next) {
    if (!req.user) {
        res.status(401).json({ message: "unauthenticated" });
    } else {
        res.status(200).json({ user: req.user });
    }
});

/*
* ログイン
*/
// router.post("/login", passport.authenticate("local", {
//     successReturnToOrRedirect: "/",
//     failureRedirect: "/users/login",
//     failureMessage: true,
//     keepSessionInfo: true
// }));

router.post('/login',
    passport.authenticate('local'), (req, res,next) => {
        try{
            res.status(200).json({ message:"OK"});
        }catch (error) {
            res.status(400).json({message: error.message});
        }
    }
);
/*
* 新規登録
*/
router.post("/signup", async (req, res, next) => {
    try {
        const {name, pass} = req.body;
        if (!name) {
            return res.status(400).json({message: "not name"});
        }
        const salt = generateSalt();
        const hashedPassword = calcHash(pass, salt);
        await prisma.user.create({
            data: {
                name,
                pass: hashedPassword,
                salt
            }
        });
        res.status(200).json({message: "created!"});
    } catch (error) {
        res.status(400).json({message: error.message});
    }
});

/*
* ログアウト
*/
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
    });
    res.status(200).json({message: "OK"});
});
export default router;
