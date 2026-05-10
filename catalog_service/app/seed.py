from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Category, Product


CATEGORIES = [
    ("LED", "Светодиодные лампы — самый энергоэффективный выбор"),
    ("Галогенные", "Тёплый свет, мгновенное включение"),
    ("Люминесцентные", "Большой световой поток при низкой мощности"),
    ("Накаливания", "Классические лампы с тёплым спектром"),
    ("Умные", "Управление через приложение, RGB и сценарии"),
]


def _products(category_ids: dict[str, int]) -> list[dict]:
    led = category_ids["LED"]
    halogen = category_ids["Галогенные"]
    fluorescent = category_ids["Люминесцентные"]
    incandescent = category_ids["Накаливания"]
    smart = category_ids["Умные"]
    return [
        dict(sku="LED-E27-10W-WW", name="LED E27 10Вт Тёплый",
             description="Светодиодная лампа с тёплым свечением 2700K. Подходит для жилых помещений, ресторанов, гостиных.",
             category_id=led, price=Decimal("189.00"), stock_quantity=240,
             wattage=Decimal("10"), voltage=230, base_type="E27", color_temp=2700, lifespan_hours=25000),
        dict(sku="LED-E14-7W-CW", name="LED E14 7Вт Холодный",
             description="Компактная LED-лампа с холодным дневным светом 6500K. Идеальна для рабочих зон и кухни.",
             category_id=led, price=Decimal("149.00"), stock_quantity=180,
             wattage=Decimal("7"), voltage=230, base_type="E14", color_temp=6500, lifespan_hours=20000),
        dict(sku="HAL-GU10-35W", name="Галоген GU10 35Вт",
             description="Галогенная лампа направленного света. Подойдёт для точечных светильников и витрин.",
             category_id=halogen, price=Decimal("299.00"), stock_quantity=90,
             wattage=Decimal("35"), voltage=230, base_type="GU10", color_temp=3000, lifespan_hours=2000),
        dict(sku="LED-E27-15W-NW", name="LED E27 15Вт Нейтр.",
             description="Мощная светодиодная лампа нейтрального света 4000K. Универсальный выбор для офиса.",
             category_id=led, price=Decimal("249.00"), stock_quantity=120,
             wattage=Decimal("15"), voltage=230, base_type="E27", color_temp=4000, lifespan_hours=30000),
        dict(sku="LED-GU53-5W", name="LED GU5.3 5Вт",
             description="Светодиодная капсула формата MR16. Замена галогенным лампам без перегрева.",
             category_id=led, price=Decimal("199.00"), stock_quantity=150,
             wattage=Decimal("5"), voltage=12, base_type="GU5.3", color_temp=3000, lifespan_hours=25000),
        dict(sku="INC-E27-60W", name="Накаливания E27 60Вт",
             description="Классическая лампа накаливания. Привычный тёплый свет, мгновенное включение.",
             category_id=incandescent, price=Decimal("79.00"), stock_quantity=320,
             wattage=Decimal("60"), voltage=230, base_type="E27", color_temp=2700, lifespan_hours=1000),
        dict(sku="LED-E27-20W-WW", name="LED E27 20Вт Тёплый",
             description="Светодиодная лампа повышенной мощности. Заменяет лампу накаливания 150 Вт.",
             category_id=led, price=Decimal("349.00"), stock_quantity=60,
             wattage=Decimal("20"), voltage=230, base_type="E27", color_temp=2700, lifespan_hours=30000),
        dict(sku="FLU-E27-20W", name="Люмин. E27 20Вт",
             description="Энергосберегающая люминесцентная лампа. Большой световой поток при умеренной мощности.",
             category_id=fluorescent, price=Decimal("259.00"), stock_quantity=75,
             wattage=Decimal("20"), voltage=230, base_type="E27", color_temp=4000, lifespan_hours=8000),
        dict(sku="LED-E14-5W-WW", name="LED E14 5Вт Тёплый",
             description="Светодиодная лампа форм-фактора «свеча». Подходит для люстр и бра.",
             category_id=led, price=Decimal("129.00"), stock_quantity=200,
             wattage=Decimal("5"), voltage=230, base_type="E14", color_temp=2700, lifespan_hours=20000),
        dict(sku="LED-GU10-7W", name="LED GU10 7Вт",
             description="LED-софит с цоколем GU10. Угол светового потока 60°, подходит для трекового освещения.",
             category_id=led, price=Decimal("219.00"), stock_quantity=130,
             wattage=Decimal("7"), voltage=230, base_type="GU10", color_temp=3000, lifespan_hours=25000),
        dict(sku="HAL-E27-60W", name="Галоген E27 60Вт",
             description="Галогенная лампа общего назначения с тёплым светом и высоким индексом цветопередачи.",
             category_id=halogen, price=Decimal("189.00"), stock_quantity=110,
             wattage=Decimal("60"), voltage=230, base_type="E27", color_temp=2900, lifespan_hours=2500),
        dict(sku="SMART-E27-12W-RGB", name="LED E27 12Вт RGB",
             description="Умная RGB-лампа с управлением через приложение, поддержка сценариев и регулировка яркости.",
             category_id=smart, price=Decimal("599.00"), stock_quantity=45,
             wattage=Decimal("12"), voltage=230, base_type="E27", color_temp=4000, lifespan_hours=25000),
        dict(sku="LED-E14-9W-CW", name="LED E14 9Вт Холодн.",
             description="Светодиодная лампа с холодным светом 6500K и высокой светоотдачей.",
             category_id=led, price=Decimal("169.00"), stock_quantity=140,
             wattage=Decimal("9"), voltage=230, base_type="E14", color_temp=6500, lifespan_hours=25000),
        dict(sku="INC-E14-40W", name="Накаливания E14 40Вт",
             description="Лампа накаливания с цоколем «миньон». Тёплый, привычный свет для декоративных светильников.",
             category_id=incandescent, price=Decimal("59.00"), stock_quantity=280,
             wattage=Decimal("40"), voltage=230, base_type="E14", color_temp=2700, lifespan_hours=1000),
        dict(sku="LED-GU53-7W", name="LED GU5.3 7Вт",
             description="LED-капсула с расширенным углом рассеивания и низким энергопотреблением.",
             category_id=led, price=Decimal("229.00"), stock_quantity=100,
             wattage=Decimal("7"), voltage=12, base_type="GU5.3", color_temp=4000, lifespan_hours=25000),
        dict(sku="LED-E27-8W-WW", name="LED E27 8Вт Тёплый",
             description="Базовая LED-лампа с тёплым свечением. Подойдёт для большинства домашних светильников.",
             category_id=led, price=Decimal("159.00"), stock_quantity=220,
             wattage=Decimal("8"), voltage=230, base_type="E27", color_temp=2700, lifespan_hours=20000),
        dict(sku="HAL-GU53-50W", name="Галоген GU5.3 50Вт",
             description="Галогенная капсула высокой мощности. Подходит для встроенных потолочных светильников.",
             category_id=halogen, price=Decimal("279.00"), stock_quantity=70,
             wattage=Decimal("50"), voltage=12, base_type="GU5.3", color_temp=3000, lifespan_hours=2000),
        dict(sku="LED-E27-6W-CDL", name="LED E27 6Вт Свеча",
             description="Декоративная лампа форм-фактора «свеча» с цоколем E27 и тёплым свечением.",
             category_id=led, price=Decimal("179.00"), stock_quantity=150,
             wattage=Decimal("6"), voltage=230, base_type="E27", color_temp=2700, lifespan_hours=20000),
        dict(sku="LED-E14-4W-MINI", name="LED E14 4Вт Мини",
             description="Миниатюрная светодиодная лампа для компактных светильников и подсветок.",
             category_id=led, price=Decimal("119.00"), stock_quantity=240,
             wattage=Decimal("4"), voltage=230, base_type="E14", color_temp=3000, lifespan_hours=20000),
        dict(sku="LED-GU10-10W", name="LED GU10 10Вт",
             description="Мощный LED-софит для трекового освещения и точечных светильников высокой яркости.",
             category_id=led, price=Decimal("269.00"), stock_quantity=95,
             wattage=Decimal("10"), voltage=230, base_type="GU10", color_temp=4000, lifespan_hours=30000),
    ]


async def seed_if_empty(session: AsyncSession) -> None:
    existing = (await session.execute(select(Category).limit(1))).scalar_one_or_none()
    if existing is not None:
        return

    name_to_id: dict[str, int] = {}
    for name, description in CATEGORIES:
        cat = Category(name=name, description=description)
        session.add(cat)
        await session.flush()
        name_to_id[name] = cat.id

    for data in _products(name_to_id):
        session.add(Product(**data))

    await session.commit()
