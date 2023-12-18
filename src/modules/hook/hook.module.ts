import { Module } from '@nestjs/common';
import { EventHookNotificationService } from './services/hook_notification.service';
import { EventHookWorkerService } from './services/hook_do.service';
import { EventHookAdderService } from './services/hook_add.service';
import { NotificationHelper } from '../notification/helper/notification.helper';
import { ChallengeActivityService } from '../challenge/services/challenge_activity.service';
import { ChallengePermissionService } from '../challenge/services/challenge_permission.service';
import { UserService } from '../user/services/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChallengePermission, ChallengePermissionSchema } from '../challenge/schemas/challenge_permission.schema';
import { ChannelService } from '../channel/services/channel.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { NotificationService } from '../notification/services/notification.service';
import { UserSessionService } from '../user/services/user_session.service';
import { UserPermissionService } from '../user_permission/services/user_permission.service';
import { JwtHelperService } from '../core/services/jwt_helper.service';
import { GiftService } from '../gift/services/gift.service';
import { ChallengeActivity, ChallengeActivitySchema } from '../challenge/schemas/challenge_activity.schema';
import { Channel } from 'diagnostics_channel';
import { ChannelSchema } from '../channel/schemas/channel.schema';
import { Notification, NotificationSchema } from '../notification/schemas/notification.schema';
import { UserSession, UserSessionSchema } from '../user/schemas/user_session.schema';
import { UserPermission, UserPermissionSchema } from '../user_permission/schemas/user_permission.schema';
import { Gift, GiftSchema } from '../gift/schemas/gift.schema';
import { ChannelPermission, ChannelPermissionSchema } from '../channel/schemas/channel_permission.schema';
import { GiftHelper } from '../gift/helper/gift.helper';
import { Redeem, RedeemSchema } from '../redeem/schemas/redeem.schema';
import { RedeemMission, RedeemMissionSchema } from '../redeem/schemas/redeem_mission.schema';
import { RedeemPermission, RedeemPermissionSchema } from '../redeem/schemas/redeem_permission.schema';
import { UserGiftService } from '../gift/services/user_gift.service';
import { TransactionHelper } from '../transaction/helper/transaction.helper';
import { ChatMediaService } from '../chat_media/services/chat_media.service';
import { ChatHistoryHelper } from '../chat_history/helpers/chat_history.helper';
import { ChannelPermissionService } from '../channel/services/channel_permission.service';
import { QueueService } from '../queue/queue.service';
import { UserGift, UserGiftSchema } from '../gift/schemas/user_gift.schema';
import { TransactionService } from '../transaction/services/transaction.service';
import { TransactionBankService } from '../transaction/services/transaction_bank.service';
import { UserOptionService } from '../user/services/user_option.service';
import { ChatMedia, ChatMediaSchema } from '../chat_media/schemas/chat_media.schema';
import { ChatHistoryService } from '../chat_history/services/chat_history.service';
import { ChatRoomUserOptionService } from '../chat_room/services/chat_room_user_option.service';
import { ChatRoomService } from '../chat_room/services/chat_room.service';
import { ChannelLevel, ChannelLevelSchema } from '../channel/schemas/channel_level.schema';
import { ChannelPointHistory, ChannelPointHistorySchema } from '../channel/schemas/channel_point_history.schema';
import { BullModule } from '@nestjs/bull';
import { Transaction, TransactionSchema } from '../transaction/schemas/transaction.schema';
import { TransactionBank } from '../transaction/schemas/transaction_bank.schema';
import { UserOption, UserOptionSchema } from '../user/schemas/user_option.schema';
import { ChatHistory, ChatHistorySchema } from '../chat_history/schemas/chat_history.schema';
import { ChatRoomUserOption, ChatRoomUserOptionSchema } from '../chat_room/schemas/chat_room_user_option.schema';
import { ChatRoom, ChatRoomSchema } from '../chat_room/schemas/chat_room.schema';

@Module({

    imports: [
        BullModule.registerQueueAsync(
            {
                name: 'gift'
            },
            {
                name: 'noti'
            },
            {
                name: 'challenge'
            }),
        MongooseModule.forFeature([
            { name: ChallengePermission.name, schema: ChallengePermissionSchema },
            { name: User.name, schema: UserSchema },
            { name: ChallengeActivity.name, schema: ChallengeActivitySchema },
            { name: Channel.name, schema: ChannelSchema },
            { name: Notification.name, schema: NotificationSchema },
            { name: UserSession.name, schema: UserSessionSchema },
            { name: UserPermission.name, schema: UserPermissionSchema },
            { name: Gift.name, schema: GiftSchema },
            { name: ChannelPermission.name, schema: ChannelPermissionSchema },
            { name: Redeem.name, schema: RedeemSchema },
            { name: RedeemMission.name, schema: RedeemMissionSchema },
            { name: RedeemPermission.name, schema: RedeemPermissionSchema },
            { name: UserGift.name, schema: UserGiftSchema },
            { name: ChatMedia.name, schema: ChatMediaSchema },
            { name: ChannelLevel.name, schema: ChannelLevelSchema },
            { name: ChannelPointHistory.name, schema: ChannelPointHistorySchema },
            { name: Transaction.name, schema: TransactionSchema },
            { name: TransactionBank.name, schema: TransactionSchema },
            { name: UserOption.name, schema: UserOptionSchema },
            { name: ChatHistory.name, schema: ChatHistorySchema },
            { name: ChatRoomUserOption.name, schema: ChatRoomUserOptionSchema },
            { name: ChatRoom.name, schema: ChatRoomSchema },
        ])],
    providers: [EventHookNotificationService, EventHookWorkerService,
        EventHookAdderService, NotificationHelper, ChallengeActivityService,
        ChallengePermissionService, UserService, ChannelService, NotificationService, UserSessionService,
        GiftHelper, GiftService, UserGiftService, TransactionHelper, ChatMediaService, ChatHistoryHelper, ChannelPermissionService,
        UserPermissionService, JwtHelperService, GiftService, QueueService, TransactionService, TransactionBankService,
        UserOptionService, ChatHistoryService, ChatRoomUserOptionService, ChatRoomService],
    exports: [EventHookNotificationService,
        EventHookWorkerService,
        EventHookAdderService,
    ]
})
export class HookModule { }
