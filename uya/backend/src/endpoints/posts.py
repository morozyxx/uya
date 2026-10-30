from typing import List
from fastapi import APIRouter, Depends, Cookie, HTTPException, status, Response
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.posts import PostsORM
from src.models.users import UsersORM
from src.schemas.posts import PostSchema, NewPostSchema, DeletePostSchema, AllPostsResponseSchema
from src.db import get_session
from src.helper import decode_token, check_jwt_errors

router = APIRouter(prefix="/posts", tags=["Posts"])

@router.get("/", response_model=List[AllPostsResponseSchema])
async def get_all_posts(
        session: AsyncSession = Depends(get_session)
):
    query = select(PostsORM).order_by(PostsORM.id.desc())
    executed = await session.execute(query)
    db_posts = executed.scalars().all()

    posts = []
    for post in db_posts:
        user_query = select(UsersORM).filter_by(id=post.user_id)
        user_executed = await session.execute(user_query)
        user_scalar = user_executed.scalar_one_or_none()
        user_username = user_scalar.username

        posts.append(AllPostsResponseSchema.model_validate({
            "title": post.title
            , "description": post.description
            , "platform": post.platform
            , "link": post.link
            , "image": post.image
            , "username": user_username
        }))

    return posts


@router.post("/new")
async def new_post(
        payload: NewPostSchema
        , access_token: str | None = Cookie(default=None)
        , session: AsyncSession = Depends(get_session)
) -> Response:
    # if not access_token:
    #     raise HTTPException(
    #         status_code=status.HTTP4_401_UNAUTHORIZED
    #         , detail="Could not validate credentials",
    #     )

    decoded_data = check_jwt_errors(access_token=access_token)

    user_id = decoded_data.get("id")

    post = PostsORM(
        title=payload.title
        , description=payload.description
        , platform=payload.platform
        , link=payload.link
        , image=payload.image
        , user_id=user_id
    )

    session.add(post)
    await session.commit()

    return Response(status_code=status.HTTP_201_CREATED)


@router.get("/all", response_model=List[PostSchema])
async def get_all_user_posts(
        access_token: str | None = Cookie(default=None)
        , session: AsyncSession = Depends(get_session)
):
    # if not access_token:
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED
    #         , detail="Could not validate credentials",
    #     )

    decoded_data = check_jwt_errors(access_token=access_token)

    user_id = decoded_data.get("id")

    query = select(PostsORM).filter_by(user_id=user_id).order_by(PostsORM.id.desc())
    executed = await session.execute(query)
    db_posts = executed.scalars().all()

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

    return posts


@router.post("/edit")
async def edit_post(
        payload: PostSchema
        , access_token: str | None = Cookie(default=None)
        , session: AsyncSession = Depends(get_session)
) -> Response:
    # if not access_token:
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED
    #         , detail="Could not validate credentials",
    #     )

    decoded_data = check_jwt_errors(access_token=access_token)

    user_id = decoded_data.get("id")

    update_post = update(PostsORM).values(
        title=payload.title
        , description=payload.description
        , platform=payload.platform
        , link=payload.link
        , image=payload.image
    ).filter_by(id=payload.id, user_id=user_id)

    await session.execute(update_post)
    await session.commit()

    return Response(status_code=status.HTTP_202_ACCEPTED)


@router.delete("/delete")
async def delete_post(
        payload: DeletePostSchema
        , access_token: str | None = Cookie(default=None)
        , session: AsyncSession = Depends(get_session)
):
    # if not access_token:
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED
    #         , detail="Could not validate credentials",
    #     )

    decoded_data = check_jwt_errors(access_token=access_token)

    user_id = decoded_data.get("id")

    delete_query = delete(PostsORM).filter_by(id=payload.id, user_id=user_id)

    await session.execute(delete_query)
    await session.commit()
