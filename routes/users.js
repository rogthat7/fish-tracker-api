const express = require('express');
router = express.Router();
const User = require('../models/user');
// Get
router.get('/getusers', async(req, res) =>{
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.send('Error: ' + error);
    }
});
// Get by Id 
router.get('/:id', async(req, res) =>{
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (error) {
        res.send('Error: ' + error);
    }
});
//Patch Request
router.patch('/update/:id', async(req, res) =>{
    try {
        const user = await User.findById(req.params.id);

        user.isAdmin = req.body.isAdmin;
        const a1 = await user.save(user);
        res.json(a1);
    } catch (error) {
        res.send('ErrorPatch: ' + error);
    }
});
//Delete by Id
router.delete('/delete/:id', async(req, res) =>{
    try {
        const user = await User.findById(req.params.id);

        const a1 = await user.delete(user);
        res.json("User with the Id:" + req.params.id + " Deleted.");
    } catch (error) {
        res.send('ErrorDelete: ' + error);
    }
});

// Post: Create New User
router.post('/createuser', async(req, res) =>{
    
        const user = new User({
            name: req.body.name,
            password: req.body.password,
            phoneNumber: req.body.phoneNumber,
            isAdmin: req.body.isAdmin
        });
        
    try {
        const a1 = await user.save();
        res.json(a1);
    } catch (error) {
        res.status(500).send('ErrorPost: ' + error);
    }
});

module.exports = router;
