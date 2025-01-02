import {
    RegisterUserRequest,
    UserResponse,
    toUserResponse,
    LoginUserRequest,
    UpdateUserRequest,
} from "../model/user-model";
import { UserValidation } from "../validation/user-validation";
import prisma from "../../prisma/client";
import { HTTPException } from "hono/http-exception";
import { User } from "@prisma/client";

export class UserService {
    static async register(request: RegisterUserRequest): Promise<UserResponse> {
        request = UserValidation.REGISTER.parse(request);

        const checkUsername = await prisma.user.count({
            where: {
                username: request.username,
            },
        });

        if (checkUsername != 0) {
            throw new HTTPException(400, {
                message: "Username already exists",
            });
        }

        request.password = await Bun.password.hash(request.password, {
            algorithm: "bcrypt",
            cost: 10,
        });

        const user = await prisma.user.create({
            data: request,
        });

        return toUserResponse(user);
    }

    static async login(request: LoginUserRequest): Promise<UserResponse> {
        request = UserValidation.LOGIN.parse(request);

        let user = await prisma.user.findFirst({
            where: {
                username: request.username,
            },
        });

        if (!user) {
            throw new HTTPException(401, {
                message: "Username or password is wrong",
            });
        }

        const isPasswordValid = await Bun.password.verify(
            request.password,
            user.password,
            "bcrypt"
        );
        if (!isPasswordValid) {
            throw new HTTPException(401, {
                message: "Username or password is wrong",
            });
        }

        user = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                token: crypto.randomUUID(),
            },
        });

        const response = toUserResponse(user);
        response.token = user.token!;
        return response;
    }

    static async get(token: string | undefined | null): Promise<User> {
        const result = UserValidation.TOKEN.safeParse(token);

        if (result.error) {
            throw new HTTPException(401, {
                message: "Unauthorized",
            });
        }

        token = result.data;

        const user = await prisma.user.findFirst({
            where: {
                token: token,
            },
        });

        if (!user) {
            throw new HTTPException(401, {
                message: "Unauthorized",
            });
        }

        return user;
    }

    static async update(
        user: User,
        request: UpdateUserRequest
    ): Promise<UserResponse> {
        request = UserValidation.UPDATE.parse(request);

        if (request.name) {
            user.name = request.name;
        }

        if (request.password) {
            user.password = await Bun.password.hash(request.password, {
                algorithm: "bcrypt",
                cost: 10,
            });
        }

        user = await prisma.user.update({
            where: {
                id: user.id,
            },
            data: user,
        });

        return toUserResponse(user);
    }

    static async logout(user: User): Promise<boolean> {
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                token: null,
            },
        });

        return true;
    }
}
