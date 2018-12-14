Component({
  data: {},
  properties: {
    question: Object
  },
  methods: {
    onTapOption(e) {
      const {
        question
      } = this.data;
      const {
        option
      } = e.target.dataset;
      if (question.answer) return;
      question.answer = option;
      question.options.forEach(opt => {
        if (opt.correct) {
          opt.style = 'correct';
        }

        if (opt.text == option.text) {
          opt.style = opt.correct ? 'correct' : 'wrong';
        }
      });
      this.setData({
        question
      });
    }

  }
});