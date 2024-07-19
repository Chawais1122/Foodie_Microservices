import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '../entities';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(user: User, subject: string, otp: number) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Foodie" dev@narsunprojects.com',
        subject,
        replyTo: '"No Reply" dev@narsunprojects.com',
        template: './verification',
        context: {
          // filling curly brackets with content
          name: user.name,
          subject,
          otp,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
