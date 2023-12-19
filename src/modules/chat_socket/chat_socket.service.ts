import { Injectable } from "@nestjs/common";
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server } from "socket.io";
import { JwtHelperService } from "../core/services/jwt_helper.service";
import { SocketDataSocketĐto } from "./dto/socket_data-socket.dto";
// import { ChatRoomUserOptionService } from '../chat_room/services/chat_room_user_option.service';
// import { UserService } from '../user/services/user.service';
import { User } from "../user/schemas/user.schema";
// import { UserOptionService } from '../user/services/user_option.service';

@Injectable()
@WebSocketGateway(34559, {
  cors: {
    origin: "*",
  },
  namespace: "socket",
})
export class ChatSocketService implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    // private readonly chatRoomUserOptionService: ChatRoomUserOptionService,
    private readonly jwtHelper: JwtHelperService // private readonly userService: UserService,
  ) // private readonly userOptionService: UserOptionService,
  {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("chat_socket_service");

  // @SubscribeMessage('typingToServer')
  // async handleTyping(client: SocketDataSocketĐto, payload: string) {
  //   try {
  //     let roomObject = payload.split("_");
  //     if (roomObject[1]) {
  //       let roomId = roomObject[1];
  //       let authObject = await this.jwtHelper.validateAuth(client.handshake, true);
  //       if (authObject.status) {
  //         //Update Status User
  //         let userObject = authObject.data?.user_object;
  //         let userId = userObject._id.toString();
  //         let dataUserOptionFilter = {
  //           chat_room_id: roomId,
  //           user_id: userId
  //         }
  //         let userRoomObject = await this.chatRoomUserOptionService.findOne(dataUserOptionFilter);
  //         if (!userRoomObject) {
  //           this.logger.log("User is not in Room");
  //           return;
  //         }
  //         let dataReturn = {
  //           chat_room_id: roomId,
  //           user_id: userObject._id.toString(),
  //           display_name: userObject.display_name
  //         }
  //         this.server.to(payload).emit('typingToClient', JSON.stringify(dataReturn));

  //       } else {
  //         this.logger.log("User is not in Room");
  //         return;
  //       }
  //     } else {
  //       this.logger.log("Token is invalid");
  //       return;
  //     }
  //   } catch (error) {
  //     this.logger.log("Error socket: " + JSON.stringify(error.message));
  //   }
  // }

  // @SubscribeMessage('joinRoom')
  // async handleJoinRoom(client: SocketDataSocketĐto, payload: string) {
  //   try {
  //     let roomObject = payload.split("_");
  //     if (roomObject[1]) {
  //       let roomId = roomObject[1];
  //       let authObject = await this.jwtHelper.validateAuth(client.handshake, true);
  //       if (authObject.status) {
  //         let userData = authObject.data;
  //         //Update Status User
  //         let userObject = authObject.data?.user_object;
  //         let userId = userObject._id.toString();

  //         let dataUserOptionFilter = {
  //           chat_room_id: roomId,
  //           user_id: userId
  //         }
  //         let userRoomObject = await this.chatRoomUserOptionService.findOne(dataUserOptionFilter);
  //         if (!userRoomObject) {
  //           this.logger.log("User is not in Room");
  //           return;
  //         }
  //         if (client.room) {
  //           //Lear Room
  //           if (!client.user_id) return;
  //           client.leave(client.room);
  //           this.logger.log('Leave room: ' + client.room + ' successfully!');
  //         }
  //         client.room = payload;
  //         client.join(payload);
  //         this.logger.log("User join Room Successfully! Room: " + payload);
  //       } else {
  //         this.logger.log("User is not in Room");
  //         return;
  //       }
  //     } else {
  //       this.logger.log("Token is not invalid");
  //       return;
  //     }
  //   } catch (error) {
  //     this.logger.log("Error socket: " + JSON.stringify(error.message));
  //   }
  // }

  /**
   * @author Tony Vu
   * @param server
   */
  afterInit(server: Server) {
    this.logger.log("Init");
  }

  // /**
  //  * @author Tony Vu
  //  * @param message
  //  * @param partnerId
  //  * @param userId
  //  */
  // handleSendMessage(message: any, messageForPartner: any, partnerArray: User[], userId: string, ) {
  //   let roomId = 'room_' + message.chat_room_id;
  //   this.logger.log("Send a Message to room: " + roomId);
  //   this.server.to(roomId).emit('msgToClient', JSON.stringify(message));
  //   for (let userObject of partnerArray) {
  //     this.server.to('user_' + userObject._id.toString()).emit('msgToUser', JSON.stringify(messageForPartner))
  //   }
  //   this.server.to('user_' + userId).emit('msgToUser', JSON.stringify(message))
  // }

  /**
   * @author Tony Vu
   * @param message
   * @param partnerId
   * @param userId
   */
  handleSendOrder(orderObject: any, userId: string) {
    this.server.to("user_" + userId).emit("paymentSuccess", orderObject);
  }

  // /**
  //  * @author Tony Vu
  //  * @param token
  //  * @param userObject
  //  * @param partnerObject
  //  * @param callType
  //  */
  // handleMakeCall(token: string, userObject: any, partnerObject: any, callType: string, roomId: string, callTime: string, chatRoomId: string) {
  //   let userId = userObject._id.toString();
  //   let partnerId = partnerObject._id.toString();
  //   this.logger.log("Send a Call to room: " + partnerId);
  //   let dataToSend = {
  //     from_user: userObject,
  //     to_user: partnerObject,
  //     token: token,
  //     call_type: callType,
  //     call_time: callTime,
  //     room_id: roomId,
  //     chat_room_id: chatRoomId
  //   }
  //   this.server.to('user_' + partnerId).emit('makeCall', JSON.stringify(dataToSend))
  //   this.server.to('user_' + userId).emit('makeCall', JSON.stringify(dataToSend))
  // }

  // /**
  //  * @author Tony Vu
  //  * @param userObject
  //  * @param partnerObject
  //  * @param callType
  //  */
  // handleEndCall(userObject: any, partnerObject: any, callType: string, roomId: string, callTime: string, chatRoomId: string) {
  //   let userId = userObject._id.toString();
  //   let partnerId = partnerObject._id.toString();
  //   this.logger.log("Send a Call to room: " + partnerId);
  //   let dataToSend = {
  //     from_user: userObject,
  //     to_user: partnerObject,
  //     call_type: callType,
  //     call_time: callTime,
  //     room_id: roomId,
  //     chat_room_id: chatRoomId
  //   }
  //   this.server.to('user_' + partnerId).emit('endCall', JSON.stringify(dataToSend))
  //   this.server.to('user_' + userId).emit('endCall', JSON.stringify(dataToSend))
  // }

  /**
   * @author Tony Vu
   * @param client
   * @returns
   */
  async handleDisconnect(client: SocketDataSocketĐto) {
    try {
      let authObject = await this.jwtHelper.validateAuth(client.handshake, true);
      if (authObject.status) {
        let userData = authObject.data;
        //Update Status User
        let userObject = authObject.data?.user_object;
        let currentTime = new Date();
        //Update User Status
        let dataToUpdate = {
          _id: userObject._id.toString(),
          user_active: 0,
          last_active: currentTime.toUTCString(),
        };
        client.leave("user_" + userObject._id.toString());
        this.logger.log("User " + userObject._id.toString() + " disconnect successfully!");
        if (client.room) {
          if (!client.user_id.toString()) return;
          client.leave(client.room);
          this.logger.log("Leave room: " + client.room + " successfully!");
        }
        //await this.userService.update(dataToUpdate);

        dataToUpdate = { ...dataToUpdate, ...{ user_id: userObject._id.toString() } };

        delete dataToUpdate._id;
        //await this.userOptionService.update(dataToUpdate);
      } else {
        this.logger.log("Token is not invalid");
        return;
      }
    } catch (error) {
      this.logger.log("Error socket: " + JSON.stringify(error.message));
    }
  }

  /**
   * @author Tony Vu
   * @param client
   * @param args
   * @returns
   */
  public async handleConnection(client: SocketDataSocketĐto, ...args: any[]) {
    try {
      let authObject = await this.jwtHelper.validateAuth(client.handshake, true);
      if (authObject.status) {
        //Update Status User
        let userObject = authObject.data?.user_object;

        let currentTime = new Date();
        this.logger.log("User " + userObject._id.toString() + " connect successfully!");
        client.user_id = userObject._id.toString();
        client.join("user_" + userObject._id.toString());
        let dataUpdate = {
          _id: userObject._id.toString(),
          user_active: 1,
          last_active: currentTime.toUTCString(),
        };
        //await this.userService.update(dataUpdate);
        dataUpdate = { ...dataUpdate, ...{ user_id: userObject._id.toString() } };
        delete dataUpdate._id;
        //await this.userOptionService.update(dataUpdate);
      } else {
        this.logger.log("Token is not invalid");
        return;
      }
    } catch (error) {
      this.logger.log("Error socket: " + JSON.stringify(error.message));
    }
  }
}
