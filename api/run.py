import uvicorn
from api.main import app
from api.utils.config import Config

if __name__ == "__main__":
    Config.validate()  # 設定の検証
    uvicorn.run(
        "api.main:app",
        host=Config.HOST,
        port=Config.PORT,
        reload=Config.DEBUG
    )