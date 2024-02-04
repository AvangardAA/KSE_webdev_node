const express = require('express');
const router = express.Router();
const { Fruit } = require('../models/fruits');

router.get('/', async (req, res) => 
{
    try 
    {
        const fruits = await Fruit.find();
        res.render('fruitList', { fruits });
    } 
    catch (e) 
    {
        console.error(e);
        res.status(500).send('internal server error');
    }
});

router.get('/new', (req, res) => 
{
    res.render('newFruit');
});

router.post('/', async (req, res) => 
{
    try 
    {
        const { name, price, fresh_till } = req.body;
        const newFruit = new Fruit({ name, price, fresh_till });
        await newFruit.save();
        res.redirect('/fruit/');
    } 
    catch (e) 
    {
        console.error(e);
        res.status(500).send('internal server error');
    }
});

router.get('/:id', async (req, res) => 
{
    try 
    {
        const fruit = await Fruit.findById(req.params.id);
        if (!fruit) 
        {
            return res.status(404).send('fruit doesnt exist');
        }
        res.render('fruitDetail', { fruit });
    } 
    catch (e) 
    {
        console.error(e);
        res.status(500).send('internal server error');
    }
});

module.exports = router;
