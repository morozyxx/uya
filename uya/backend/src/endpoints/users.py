from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.params import Cookie
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.posts import PostsORM
from src.schemas.users import SignUpSchema, SignInSchema, AuthResponseSchema, EditProfileSchema, UserProfileSchema, UserProfileResponseSchema
from src.schemas.posts import PostSchema
from src.db import get_session
from src.models.users import UsersORM
from src.helper import hash_pwd, verify_pwd, create_token, decode_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/sign_up")
async def sing_up(
        payload: SignUpSchema
        , session: AsyncSession = Depends(get_session)
) -> Response:
    # Check if user exists
    query = select(UsersORM).filter_by(username=payload.username)
    ex = await session.execute(query)
    res = ex.scalar_one_or_none()

    if res:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT
            , detail="User with that username already exists."
        )

    # Adding new user
    new_user = UsersORM(
        username=payload.username
        , email=payload.email
        , password=hash_pwd(payload.password)
    )
    session.add(new_user)
    await session.commit()

    return Response(status_code=status.HTTP_201_CREATED, content="User created successfully.")


@router.post("/sign_in")
async def sing_in(
        response: Response
        , payload: SignInSchema
        , session: AsyncSession = Depends(get_session)
):
    query = select(UsersORM).filter_by(username=payload.username)
    ex = await session.execute(query)
    res = ex.scalar_one_or_none()

    # Raise error if not user
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND
            , detail="User with that username does not exist."
        )

    verified_pwd = verify_pwd(pwd=payload.password, hashed_pwd=res.password)

    # Raise error if provided password != real password
    if not verified_pwd:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED
            , detail="Incorrect password."
        )

    token = create_token(data={
        "username": res.username
        , "email": res.email
        , "id": res.id
    })

    response.set_cookie(
        key = "access_token"
        , value = token.access_token
        , httponly = True
        , secure = True
        , samesite = "lax"
        , domain = None
    )


@router.post("/edit")
async def edit_profile(
        response: Response
        , payload: EditProfileSchema
        , access_token: str | None = Cookie(default=None)
        , session: AsyncSession = Depends(get_session)
):
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED
            , detail="Access token is invalid."
        )

    user_exists_query = select(UsersORM).filter_by(username=payload.username)
    user_exists_ex = await session.execute(user_exists_query)
    user_exists = user_exists_ex.scalar_one_or_none()

    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT
            , detail="User with that username already exists."
        )

    decoded_data = decode_token(token=access_token)
    query = select(UsersORM).filter_by(username=decoded_data.get("username"))
    select_user_ex = await session.execute(query)
    user = select_user_ex.scalar_one()

    if not verify_pwd(pwd=payload.old_password, hashed_pwd=user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED
            , detail="Incorrect old password. Cannot change it to new."
        )

    to_update_in_users = update(UsersORM).values(
        username=payload.username
        , email=payload.email
        , password=hash_pwd(payload.new_password)
    ).filter_by(id=decoded_data.get("id"))

    await session.execute(to_update_in_users)
    await session.commit()

    response.delete_cookie(
        key = "access_token"
        , domain = None
    )

    token = create_token(data={"username": payload.username, "email": payload.email,"id": user.id})

    response.set_cookie(
        key="access_token"
        , value=token.access_token
        , httponly=True
        , secure = True
        , samesite="lax"
        , domain=None
    )


@router.get("/me", response_model=AuthResponseSchema)
async def me(
        access_token: str | None = Cookie(default=None)
        , session: AsyncSession = Depends(get_session)
):
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED
            , detail="Access token is invalid."
        )

    decoded_data = decode_token(token=access_token)
    query = select(UsersORM).filter_by(username=decoded_data.get("username"))
    ex = await session.execute(query)
    res = ex.scalar_one_or_none()

    return AuthResponseSchema.model_validate({
        "username": res.username
        , "email": res.email
        , "user_id": res.id
    })


@router.post("/user_profile",  response_model=UserProfileResponseSchema)
async def get_user_info(
        payload: UserInfoSchema
        , session: AsyncSession = Depends(get_session)
):
    # Searching user in db
    search_user_query = select(UsersORM).filter_by(username=payload.username)
    search_user_ex = await session.execute(search_user_query)
    user = search_user_ex.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND
            , detail="User not found."
        )

    # Searching given user posts
    search_posts_query = select(PostsORM).filter_by(user_id=user.id)
    search_posts_ex = await session.execute(search_posts_query)
    db_posts = search_posts_ex.scalar_one_or_none()

    posts = []
    for post in db_posts:
        posts.append(PostSchema.model_validate({
            "id": post.id
            , "title": post.title
            , "description": post.description
            , "platform": post.platform
            , "link": post.link
            , "image": post.image
        }))

    # Return validated result
    return UserProfileResponseSchema.model_validate({
        "username": user.username
        , "posts": posts
    })


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key = "access_token"
       , domain = None
    )


@router.delete("/delete")
async def delete_profile(
        response: Response
        , access_token: str | None = Cookie(default=None)
        , session: AsyncSession = Depends(get_session)
):
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED
            , detail="Access token is invalid."
        )

    decoded_data = decode_token(token=access_token)
    user_id = decoded_data.get("id")

    delete_posts_query = delete(PostsORM).filter_by(user_id=user_id)
    delete_user_query = delete(UsersORM).filter_by(id=user_id)
    await session.execute(delete_posts_query)
    await session.execute(delete_user_query)
    await session.commit()

    response.delete_cookie(
        key = "access_token"
        , domain = None
    )