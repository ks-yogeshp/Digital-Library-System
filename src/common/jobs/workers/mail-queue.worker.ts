import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { MailService } from 'src/common/mail/mail.service';

@Processor('mail-queue', { lockDuration: 300000 })
export class MailQueueWorker extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }
  async process(job: Job) {
    const { name, data } = job.data;

    try {
      await this.getMethod(name, data);
      await wait(10000);

      Logger.log(`Job ${name} processed successfully`, MailQueueWorker.name);
    } catch (error) {
      Logger.error(`Failed to process job ${name}: ${error.message}`, error.stack, MailQueueWorker.name);
      throw error;
    }
  }

  private getMethod(name: string, data) {
    switch (name) {
      case 'remainder':
        return this.mailService.sendRemainder(data);
      case 'reservation-approve':
        return this.mailService.sendReservationApproved(data);
      case 'monthly-reports':
        return this.mailService.sendMonthlyReport(data);
      default:
        throw new Error(`Queue not found: ${name}`);
    }
  }
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
