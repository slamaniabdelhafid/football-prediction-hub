from fastapi import APIRouter, HTTPException
from .. import mock_cups as mc

router = APIRouter(prefix="/api/cups", tags=["cups"])


@router.get("")
def list_cups():
    return [detail.cup for detail in mc.CUPS.values()]


@router.get("/{cup_id}")
def get_cup(cup_id: str):
    detail = mc.CUPS.get(cup_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Cup competition not found")
    return detail
