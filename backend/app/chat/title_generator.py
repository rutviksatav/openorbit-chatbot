# Automatic chat title generation service
async def generate_chat_title(
    message: str
):

    title = message.strip()

    if len(title) > 40:

        title = title[:40]

    return title
