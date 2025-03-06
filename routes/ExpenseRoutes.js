const express = require('express');
const router = express.Router();
const Joi = require('joi');
const  Property = require('../models/Property');  // Import necessary models
const  Expenses  = require('../models/Expenses');  // Import necessary models

// Define the validation schema for Expenses
const expenseValidationSchema = Joi.object({
  name: Joi.string().required(),
  amount: Joi.number().required(),
  propertyId: Joi.number().integer().required(),
});

// Route to Create Expense
router.post('/', async (req, res) => {
  const { error } = expenseValidationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, amount, propertyId } = req.body;

  try {
    // Check if the propertyId exists in the Property table
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(400).json({ message: 'Property not found with the provided propertyId.' });
    }

    // Create the new Expense record
    const newExpense = await Expenses.create({ name, amount, propertyId });
    return res.status(201).json({ message: 'Expense created successfully', expense: newExpense });
  } catch (err) {
    console.error('Error creating expense:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Route to Update Expense by ID
router.put('/:id', async (req, res) => {
  const { error } = expenseValidationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const expenseId = req.params.id;
  const { name, amount, propertyId } = req.body;

  try {
    // Check if the propertyId exists in the Property table
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(400).json({ message: 'Property not found with the provided propertyId.' });
    }

    // Find the expense by ID
    const expense = await Expenses.findByPk(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Update the expense record
    const updatedExpense = await expense.update({ name, amount, propertyId });
    return res.status(200).json({ message: 'Expense updated successfully', expense: updatedExpense });
  } catch (err) {
    console.error('Error updating expense:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// Route to Delete Expense by ID
router.delete('/:id', async (req, res) => {
  const expenseId = req.params.id;

  try {
    // Find the expense by ID
    const expense = await Expenses.findByPk(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Delete the expense record
    await expense.destroy();
    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router;
