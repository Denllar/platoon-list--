import { Drawer, Text, ScrollArea, Stack } from '@mantine/core';
import { TYPE_PLATOONS } from "../consts";

/* ---------- helpers ---------- */
const enrolled = (id, students) =>
    students.filter((s) => s.platoonId === id && s.status === 'Зачислен').length;

const courseAndSpec = (num) => {
    const str = num.toString().padStart(2, '0');
    return {
        course: str[0],
        spec: str[1],
    };
};

/* ---------- build data ---------- */
function buildTables(platoons, students) {
    // Исключаем архивные взвода
    platoons = platoons.filter((p) => !p.isInArchive);
    const base = {};
    platoons.forEach((p) => {
        const { course, spec } = courseAndSpec(p.number);
        const qty = enrolled(p.id, students);
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
            let courseRowsStart = rows.length;

            // Суммируем "всего по курсу"
            specs.forEach((sp) => {
                courseTotal += specMap[sp].totalSpec;
            });

            // Для построения строк по специальностям
            specs.forEach((sp) => {
                const { totalSpec, platoons } = specMap[sp];
                let specRowsStart = rows.length;
                platoons.forEach((p) => {
                    rows.push({
                        course: '', // потом заполним
                        platoonNumber: p.number,
                        qty: p.qty,
                        specTotal: '', // потом заполним
                        courseTotal: '', // потом заполним
                        isLastInSpec: false, // потом заполним
                        isLastInCourse: false, // потом заполним
                    });
                });
                // Устанавливаем центр строки для спец. Итого
                const specLen = platoons.length;
                if (specLen > 0) {
                    const centerIdx = specRowsStart + Math.floor(specLen / 2);
                    rows[centerIdx].specTotal = totalSpec;
                }
                // Помечаем последнюю строку спец
                if (specLen > 0) {
                    rows[specRowsStart + specLen - 1].isLastInSpec = true;
                }
            });
            // Для всего по курсу/курса
            const allRowsInCourse = rows.slice(courseRowsStart, rows.length);
            const len = allRowsInCourse.length;
            if (len > 0) {
                const centerIdx = courseRowsStart + Math.floor(len / 2);
                rows[centerIdx].course = cr;
                rows[centerIdx].courseTotal = courseTotal;
                rows[courseRowsStart + len - 1].isLastInCourse = true;
            }
            grandTotal += courseTotal;
        });

        return { title, rows, grandTotal };
    }).filter((t) => t.rows.length > 0);
}

/* ---------- Custom Table Styles ---------- */
const tableStyles = {
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        border: '1px solid black',
        fontSize: '14px',
    },
    th: {
        border: 'none',
        borderBottom: '1px solid black',
        padding: '12px 8px',
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#f5f5f5',
    },
    td: {
        border: 'none',
        padding: '8px',
        textAlign: 'center',
        verticalAlign: 'middle',
    },
    tr: {
        backgroundColor: 'white',
    },
    trStriped: {
        backgroundColor: '#f9f9f9',
    },
};

/* ---------- component ---------- */
export default function DrawerTable({ openedDrawer, drawer, platoons=[], students=[] }) {
    const tables = buildTables(platoons, students);
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
                            <Text fw={700} size="lg" mb={8}>
                                {title}
                            </Text>
                            <table style={tableStyles.table}>
                                <thead>
                                    <tr>
                                        <th style={tableStyles.th}>Курс</th>
                                        <th style={tableStyles.th}>Взвод</th>
                                        <th style={tableStyles.th}>Кол-во</th>
                                        <th style={tableStyles.th}>Итого</th>
                                        <th style={tableStyles.th}>Всего по курсу</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r, i) => {
                                        const isLastRowInTable = i === rows.length - 1;
                                        const isLastInCourse = r.isLastInCourse;

                                        // Стиль для строки: добавляем нижнюю границу только после завершения курса
                                        const rowStyle = {
                                            ...(i % 2 === 0 ? tableStyles.tr : tableStyles.trStriped),
                                            ...(isLastInCourse || isLastRowInTable
                                                ? { borderBottom: '1px solid black' }
                                                : {}),
                                        };

                                        return (
                                            <tr key={i} style={rowStyle}>
                                                <td style={tableStyles.td}>{r.course}</td>
                                                <td style={{
                                                    borderLeft: '1px solid black',
                                                    ...(r.isLastInSpec ? { borderBottom: '1px solid black' } : {}),
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    verticalAlign: 'middle',
                                                }}>
                                                    {r.platoonNumber}
                                                </td>
                                                <td style={{
                                                    ...tableStyles.td,
                                                    ...(r.isLastInSpec ? { borderBottom: '1px solid black' } : {}),
                                                }}>
                                                    {r.qty}
                                                </td>
                                                <td style={{
                                                    ...tableStyles.td,
                                                    borderRight: '1px solid black',
                                                    ...(r.isLastInSpec ? { borderBottom: '1px solid black' } : {}),
                                                }}>
                                                    {r.specTotal}
                                                </td>
                                                <td style={tableStyles.td}>{r.courseTotal}</td>
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