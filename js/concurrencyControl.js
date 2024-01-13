class Scheduler {
  constructor(limit) {
    this.limit = limit; // 最大并行任务数
    this.running = 0; // 当前运行的任务数
    this.queue = []; // 任务队列，每一个任务都是一个函数
  }

  // 创建一个任务
  createTask(callback, duration) {
    return () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          callback();
          resolve();
        }, duration);
      });
    };
  }

  /**
   * 添加一个任务
   * @param {Function} callback 任务，一个函数
   * @param {number} duration 任务的运行时长，使用定时器模拟
   * @returns void
   */
  addTask(callback, duration) {
    const task = this.createTask(callback, duration);
    this.queue.push(task);
  }

  // 启动，开始处理队列里的任务
  start() {
    for (let i = 0; i < this.limit; i++) {
      this.schedule();
    }
  }

  // 调度任务
  schedule() {
    // 当任务队列为空时或者目前并发执行的任务 >= limit 时，停止任务调度
    if (this.queue.length === 0 || this.running >= this.limit) {
      return;
    }

    this.running++;
    const task = this.queue.shift();

    task().then(() => {
      this.running--;
      this.schedule();
    });
  }
}
// 实例化一个调度器
const scheduler = new Scheduler(2);

// 添加任务
scheduler.addTask(() => {
  console.log("任务1");
}, 1000);
scheduler.addTask(() => {
  console.log("任务2");
}, 500);
scheduler.addTask(() => {
  console.log("任务3");
}, 300);
scheduler.addTask(() => {
  console.log("任务4");
}, 400);

// 任务执行
scheduler.start();

// TODO
// 任务执行异常该如何处理？
// 如何给任务添加优先级？
