import { ObjectType, Field, ID } from "type-graphql";
import "reflect-metadata";

@ObjectType("User")
export class UserType {
  @Field(() => ID)
  readonly id: string;

  @Field()
  email: string;

  @Field()
  verified: boolean;
}

@ObjectType("Access")
export class LoginResponse extends UserType {
  @Field()
  accessToken: string;
}
