const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();


router.post('/', [verifyToken, requireAdmin], async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.user);
    
    
    const event = await Event.create({
      ...req.body,
      createdBy: req.user.login
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const events = await Event.getAll();
    events.forEach(event => {
      if (!event.participants) {
        event.participants = [];
      }
      event.participants_count = event.participants.length;
      event.is_participant = event.participants.some(p => p.login === req.user.login);
    });
    console.log("events", events);
    res.json({success: true, events: events});
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/past', verifyToken, async (req, res) => {
  try {
    const events = await Event.getPast(req.user.login);
    res.json({success:true, events:events})
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/register', verifyToken, async (req, res) => {
  try {
    console.log('User attempting to register:', req.user);
    if (!req.user || !req.user.login) {
      return res.status(400).json({ error: 'User login not found in request' });
    }

    const event = await Event.getById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.participants) {
      event.participants = [];
    }

    const isParticipant = event.participants.some(p => p.login === req.user.login);
    console.log('Event:', event);
    console.log('Current participants:', event.participants);
    console.log('User login:', req.user.login);
    console.log('Is participant:', isParticipant);
    
    if(isParticipant) {
      event.participants = event.participants.filter(p => p.login !== req.user.login);
      const result = await Event.update(req.params.id, {
        participants: event.participants, 
        participants_count: event.participants.length
      });
      console.log('Update result (leave):', result);
      await User.decrementAttendance(req.user.login);
      return res.json({success: true, message: 'You have left the event successfully'});
    } else {
      event.participants.push({ login: req.user.login, rating: 0 });
      const result = await Event.update(req.params.id, {
        participants: event.participants, 
        participants_count: event.participants.length
      });
      console.log('Update result (join):', result);
      await User.incrementRegister(req.user.login);
      return res.json({success: true, message: 'You have joined the event successfully'});
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.getById(req.params.id);
    res.json(event);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:id', [verifyToken, requireAdmin], async (req, res) => {
  try {

    const event = await Event.update(req.params.id, {
      ...req.body,
      updatedBy: req.user.login
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', [verifyToken, requireAdmin], async (req, res) => {
  try {
    await Event.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;