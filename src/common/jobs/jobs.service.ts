import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import cronParser from 'cron-parser';
import Redis from 'ioredis';

@Injectable()
export class JobsService implements OnModuleInit {
  constructor(
    @InjectQueue('overdue-check') private overdueQueue: Queue,
    @InjectQueue('send-reminders') private remindersQueue: Queue,
    @InjectQueue('expired-reservations') private expiredQueue: Queue,
    @InjectQueue('monthly-reports') private monthlyReportsQueue: Queue,
    @Inject('REDIS_CLIENT') private redis: Redis
  ) {}

  private jobSchedules = [
    { queue: 'overdue-check', pattern: '0 0 * * *', jobId: 'overdue-check' },
    { queue: 'send-reminders', pattern: '0 11 * * *', jobId: 'send-reminders' },
    { queue: 'monthly-reports', pattern: '0 0 1 * *', jobId: 'monthly-reports' },
  ];

  async onModuleInit() {
    await this.setupCronJobs();
    await this.runMissedJobs();
    // await this.redis.flushall();
  }

  private async setupCronJobs() {
    for (const job of this.jobSchedules) {
      const queue = this.getQueue(job.queue);
      await queue.add(
        job.jobId,
        {},
        {
          jobId: job.jobId,
          repeat: { pattern: job.pattern },
          removeOnComplete: true,
          removeOnFail: true,
        }
      );
    }
    await this.expiredQueue.add(
      'expired-reservations',
      {},
      {
        jobId: 'expired-reservations',
        repeat: { pattern: '* * * * *' },
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }

  private getQueue(name: string): Queue {
    switch (name) {
      case 'overdue-check':
        return this.overdueQueue;
      case 'send-reminders':
        return this.remindersQueue;
      case 'monthly-reports':
        return this.monthlyReportsQueue;
      default:
        throw new Error(`Queue not found: ${name}`);
    }
  }

  private async runMissedJobs() {
    Logger.log('Checking for missed jobs on startup...');

    const now = Date.now();

    for (const job of this.jobSchedules) {
      const lastRunKey = `job:lastRun:${job.jobId}`;
      const lastRun = await this.redis.get(lastRunKey);
      let required = false;

      if (!lastRun) {
        required = true;
      } else {
        const interval = cronParser.parse(job.pattern, { currentDate: new Date(lastRun) });
        const nextScheduled = interval.next().getTime();

        if (nextScheduled <= now) {
          required = true;
        }
      }

      if (required) {
        Logger.log(`Enqueuing missed job: ${job.jobId}`);
        await this.getQueue(job.queue).add(job.jobId, {});
      }
    }
  }
}
