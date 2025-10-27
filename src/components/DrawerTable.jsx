import { Drawer, Text, ScrollArea, Stack } from '@mantine/core';
import platoons from '../../db/platoon.json';
import students from '../../db/students.json';
import { TYPE_PLATOONS } from "../consts"

/* ---------- helpers ---------- */
const enrolled = (id) =>
    students.filter((s) => s.platoonId === id && s.status === 'Зачислен').length;

const courseAndSpec = (num) => {
    const str = num.toString().padStart(2, '0');
    return {
        course: str[0],
        spec: str[1]
    };
};

/* ---------- build data ---------- */
function buildTables() {
    const base = {};

    platoons.forEach((p) => {
        const { course, spec } = courseAndSpec(p.number);
        const qty = enrolled(p.id);
        const t = p.type;

        base[t] ??= {};
        base[t][course] ??= {};
        base[t][course][spec] ??= { totalSpec: 0, platoons: [] };

        base[t][course][spec].totalSpec += qty;
        base[t][course][spec].platoons.push({ number: p.number, qty });
    });

    Object.keys(base).forEach((t) =>
        Object.keys(base[t]).forEach((cr) =>
            Object.keys(base[t][cr]).forEach((sp) => {
                base[t][cr][sp].platoons.sort((a, b) =>
                    a.number.toString().padStart(5, '0').localeCompare(b.number.toString().padStart(5, '0'))
                );
            })
        )
    );

    return TYPE_PLATOONS.map((title) => {
        const courseMap = base[title] || {};
        const courses = Object.keys(courseMap).sort((a, b) => a - b);

        let grandTotal = 0;
        const rows = [];

        courses.forEach((cr) => {
            const specMap = courseMap[cr];
            const specs = Object.keys(specMap).sort((a, b) => a - b);

            let courseTotal = 0;
            let courseRowCount = 0;

            // Сначала подсчитаем общее количество строк для курса
            specs.forEach((sp) => {
                courseTotal += specMap[sp].totalSpec;
                courseRowCount += specMap[sp].platoons.length;
            });

            // Затем формируем строки
            specs.forEach((sp, specIdx) => {
                const { totalSpec, platoons } = specMap[sp];
                const specRowCount = platoons.length;

                platoons.forEach((p, platIdx) => {
                    const isFirstCourseRow = specIdx === 0 && platIdx === 0;
                    const isFirstSpecRow = platIdx === 0;

                    rows.push({
                        course: isFirstCourseRow ? cr : '',
                        platoonNumber: p.number,
                        qty: p.qty,
                        specTotal: isFirstSpecRow ? totalSpec : '',
                        courseTotal: isFirstCourseRow ? courseTotal : '',
                        courseRowSpan: isFirstCourseRow ? courseRowCount : 0,
                        specRowSpan: isFirstSpecRow ? specRowCount : 0,
                    });
                });
            });

            grandTotal += courseTotal;
        });

        return { title, rows, grandTotal };
    })
        .filter((t) => t.rows.length > 0);
}

/* ---------- Custom Table Styles ---------- */
const tableStyles = {
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        border: '2px solid black',
        fontSize: '14px',
    },
    th: {
        border: '1px solid black',
        padding: '12px 8px',
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#f5f5f5',
    },
    td: {
        border: '1px solid black',
        padding: '8px',
        textAlign: 'center',
    },
    tr: {
        backgroundColor: 'white',
    },
    trStriped: {
        backgroundColor: '#f9f9f9',
    },
    // Стили для ячеек без границ
    noBorderBottom: {
        borderBottom: 'none',
    },
    noBorderTop: {
        borderTop: 'none',
    }
};

/* ---------- component ---------- */
export default function DrawerTable({ openedDrawer, drawer }) {
    const tables = buildTables();

    return (
        <Drawer
            opened={openedDrawer}
            onClose={drawer.close}
            position="right"
            size="xl"
        >
            <ScrollArea style={{ height: '100%' }} px="md" pb="xl">
                <Stack spacing="xl">
                    {tables.map(({ title, rows, grandTotal }) => (
                        <div key={title}>
                            <Text fw={700} size="lg" mb={8}>{title}</Text>
                            <table style={tableStyles.table}>
                                <thead>
                                    <tr>
                                        <th style={tableStyles.th}>Курс</th>
                                        <th style={tableStyles.th}>Взвод</th>
                                        <th style={tableStyles.th}>Кол-во</th>
                                        <th style={tableStyles.th}>Итого по спец.</th>
                                        <th style={tableStyles.th}>Всего по курсу</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r, i) => {
                                        // Определяем стили для ячеек с учетом объединения
                                        const isNewCourse = r.course !== '';
                                        const isNewSpec = r.specTotal !== '';

                                        // Для "Итого по спец." убираем нижнюю границу у всех строк кроме последней в группе
                                        const specTdStyle = {
                                            ...tableStyles.td,
                                            ...(!isNewSpec && i < rows.length - 1 && rows[i + 1].specTotal === '' ? tableStyles.noBorderBottom : {})
                                        };

                                        // Для "Всего по курсу" убираем все границы кроме первой и последней в группе
                                        const courseTdStyle = {
                                            ...tableStyles.td,
                                            ...(!isNewCourse ? {
                                                borderTop: 'none',
                                                borderBottom: i < rows.length - 1 && rows[i + 1].course === '' ? 'none' : '1px solid black'
                                            } : {})
                                        };

                                        return (
                                            <tr key={i} style={i % 2 === 0 ? tableStyles.tr : tableStyles.trStriped}>
                                                <td style={tableStyles.td}>{r.course}</td>
                                                <td style={tableStyles.td}>{r.platoonNumber}</td>
                                                <td style={tableStyles.td}>{r.qty}</td>
                                                <td style={specTdStyle}>{r.specTotal}</td>
                                                <td style={courseTdStyle}>{r.courseTotal}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <Text align="right" mt={8} fw={600}>
                                Итого по таблице: {grandTotal} чел.
                            </Text>
                        </div>
                    ))}
                </Stack>
            </ScrollArea>
        </Drawer>
    );
}