import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
interface UserData {
  name: string;
  email: string;
  phone_number: number;
  password: string;
}
@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(user: UserData, subject: string, otp: string) {
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
