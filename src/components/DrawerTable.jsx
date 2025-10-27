import { Drawer, Table, Text, ScrollArea, Stack } from '@mantine/core';
import platoons from '../../db/platoon.json';
import students from '../../db/students.json';

/* ---------- helpers ---------- */
const enrolled = (id) =>
  students.filter((s) => s.platoonId === id && s.status === 'Зачислен').length;

const courseAndSpec = (num) => {
  const str = num.toString().padStart(2, '0');
  return { 
    course: str[0], 
    spec: str[1] // Берем только вторую цифру как специальность для группировки
  };
};

/* ---------- build data ---------- */
function buildTables() {
  const base = {}; // base[тип][курс][spec] = { platoons:[], totalSpec }

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

  /* сортируем внутри специальности по полному номеру */
  Object.keys(base).forEach((t) =>
    Object.keys(base[t]).forEach((cr) =>
      Object.keys(base[t][cr]).forEach((sp) => {
        base[t][cr][sp].platoons.sort((a, b) =>
          a.number.toString().padStart(5, '0').localeCompare(b.number.toString().padStart(5, '0'))
        );
      })
    )
  );

  /* готовим массив для отрисовки */
  return ['Кадровые офицеры', 'Офицеры запаса', 'Солдаты запаса']
    .map((title) => {
      const courseMap = base[title] || {};
      const courses = Object.keys(courseMap).sort((a, b) => a - b);

      let grandTotal = 0;
      const rows = [];

      courses.forEach((cr) => {
        const specMap = courseMap[cr];
        const specs = Object.keys(specMap).sort((a, b) => a - b);

        // Сначала вычисляем общую сумму по курсу
        let courseTotal = 0;
        specs.forEach((sp) => {
          courseTotal += specMap[sp].totalSpec;
        });

        // Затем формируем строки
        specs.forEach((sp, specIdx) => {
          const { totalSpec, platoons } = specMap[sp];

          platoons.forEach((p, platIdx) => {
            rows.push({
              course: specIdx === 0 && platIdx === 0 ? cr : '',
              platoonNumber: p.number, // Полный номер взвода для отображения
              qty: p.qty,
              specTotal: platIdx === 0 ? totalSpec : '', // Итого по специальности
              courseTotal: specIdx === 0 && platIdx === 0 ? courseTotal : '', // Всего по курсу
            });
          });
        });
        
        grandTotal += courseTotal;
      });

      return { title, rows, grandTotal };
    })
    .filter((t) => t.rows.length > 0);
}

/* ---------- component ---------- */
export default function DrawerTable({ openedDrawer, drawer }) {
  const tables = buildTables();

  return (
    <Drawer
      opened={openedDrawer}
      onClose={drawer.close}
      position="right"
      title="Итого"
      size="xl"
    >
      <ScrollArea style={{ height: '100%' }} px="md" pb="xl">
        <Stack spacing="xl">
          {tables.map(({ title, rows, grandTotal }) => (
            <div key={title}>
              <Text fw={700} size="lg" mb={8}>{title}</Text>
              <Table
                fontSize="sm"
                striped
                highlightOnHover
                withBorder
                withColumnBorders
                styles={{
                  td: { textAlign: 'center' },
                  th: { textAlign: 'center' }
                }}
              >
                <thead>
                  <tr>
                    <th>Курс</th>
                    <th>Взвод</th>
                    <th>Кол-во</th>
                    <th>Итого по спец.</th>
                    <th>Всего по курсу</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.course}</td>
                      <td>{r.platoonNumber}</td>
                      <td>{r.qty}</td>
                      <td>{r.specTotal}</td>
                      <td>{r.courseTotal}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
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