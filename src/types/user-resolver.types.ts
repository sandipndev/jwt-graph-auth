import { ObjectType, Field, ID } from "type-graphql";

@ObjectType("UserType")
export class UserType {
  @Field(() => ID)
  readonly id: string;

  @Field()
  email: string;

  @Field()
  verified: boolean;
}

@ObjectType("LoginResponse")
export class LoginResponse extends UserType {
  @Field()
  accessToken: string;
}
