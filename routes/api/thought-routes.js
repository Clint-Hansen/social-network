const router = require('express').Router();
const { User, Thought } = require('../../models');

router.get('/', (req, res) => {
    Thought.find({})
    .select('-__v')
    .sort({ _id: -1 })
    .then(dbThoughtData => res.json(dbThoughtData))
    .catch(err => {
        console.log(err);
        res.status(400).json(err);
    });
});

router.get('/:id', ({ params }, res) => {
    Thought.findOne({ _id: params.id })
    .select('-__v')
    .then(dbThoughtData => res.json(dbThoughtData))
    .catch(err => {
        console.log(err);
        res.status(400).json(err);
    });
});

router.post('/:userId', ({ params, body }, res) => {
    Thought.create(body)
    .then(({ _id }) => {
        return User.findOneAndUpdate(
            { _id: params.userId },
            { $push: { thoughts: _id } },
            { new: true, runValidators: true }
        );
    })
    .then(dbUserData => {
        if (!dbUserData) {
            res.status(404).json({ message: 'No user found with this userId!' });
            return;
        }
        res.json(dbUserData);
    })
    .catch(err => res.json(err));
});

router.put('/:id', ({ params, body }, res) => {
    Thought.findOneAndUpdate({ _id: params.id }, body, {new: true, runValidators: true })
    .then(dbThoughtData => {
        if (!dbThoughtData) {
            res.status(404).json({ message: 'No thought found with this id!' });
            return;
          }
          res.json(dbThoughtData);
        })
        .catch(err => res.status(400).json(err));
});

router.delete('/:userId/:thoughtId', ({ params }, res) => {
    Thought.findOneAndDelete({ _id: params.thoughtId })
    .then(deletedThought => {
        if (!deletedThought) {
            return res.status(404).json({ message: 'No thought found with this id!' });
        }
        return User.findOneAndUpdate(
            { _id: params.userId },
            { $pull: { thoughts: params.thoughtId } },
            { new: true }
        );
    })
    .then(dbUserData => {
        if (!dbUserData) {
          res.status(404).json({ message: 'No user found with this id!' });
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => res.json(err));
});

router.post('/:thoughtId/reactions', ({ params, body }, res) => {
    Thought.findOneAndUpdate(
        { _id: params.thoughtId },
        { $push: { reactions: body } },
        { new: true, runValidators: true }
    )
    .then(dbThoughtData => {
        if (!dbThoughtData) {
          res.status(404).json({ message: 'No thought found with this id!' });
          return;
        }
        res.json(dbThoughtData);
      })
      .catch(err => res.json(err));
});

router.delete('/:userId/:thoughtId/:reactionId', ({ params }, res) => {
    Thought.findOneAndUpdate(
        { _id: params.thoughtId },
        { $pull: { reactions: { reactionId: params.reactionId } } },
        { new: true }
    )
    .then(dbThoughtData => res.json(dbThoughtData))
    .catch(err => res.json(err));
});


module.exports = router;