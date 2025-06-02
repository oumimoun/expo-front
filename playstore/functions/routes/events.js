const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// create event
router.post('/', [verifyToken, requireAdmin], async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user.login
    });

    await User.brodcastNotification("new_event", "New Event Added", `A new event has been created: ${req.body.title}`);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all events
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
    res.json({ success: true, events: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: error.message });
  }
});

// get past events
router.get('/past', verifyToken, async (req, res) => {
  try {
    const events = await Event.getPast(req.user.login);
    res.json({ success: true, events: events })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// register or unregister for an event
router.post('/:id/register', verifyToken, async (req, res) => {
  try {
    const event = await Event.getById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.participants) {
      event.participants = [];
    }

    const isParticipant = event.participants.some(p => p.login === req.user.login);

    if (isParticipant) {
      event.participants = event.participants.filter(p => p.login !== req.user.login);
      const result = await Event.update(req.params.id, {
        participants: event.participants,
        participants_count: event.participants.length
      });
      await User.decrementRegister(req.user.login);
      return res.json({ success: true, message: 'You have left the event successfully' });
    } else {
      event.participants.push({ login: req.user.login, rating: 0 });
      const result = await Event.update(req.params.id, {
        participants: event.participants,
        participants_count: event.participants.length
      });
      await User.incrementRegister(req.user.login);
      return res.json({ success: true, message: 'You have joined the event successfully' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// get event by id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.getById(req.params.id);
    if (!event.participants) {
      event.participants = [];
    }
    event.participants_count = event.participants.length;
    event.is_participant = event.participants.some(p => p.login === req.user.login);
    res.json({ success: true, event: event });
  } catch (error) {
    if (error.message === 'Event not found') {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// update event
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

// delete event
router.delete('/:id', [verifyToken, requireAdmin], async (req, res) => {
  try {
    await Event.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// rate event
router.post('/:id/rate', verifyToken, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const event = await Event.getById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.participants) {
      event.participants = [];
    }

    const participant = event.participants.find(p => p.login === req.user.login);
    if (!participant) {
      return res.status(400).json({ error: 'You are not a participant of this event' });
    }

    participant.rating = rating;
    participant.feedback = feedback;

    const result = await Event.update(req.params.id, {
      participants: event.participants
    });

    return res.json({ success: true, message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Rating error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;