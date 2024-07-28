import { store } from '../main.js';
import { embed } from '../util.js';
import { score } from '../score.js';
import { fetchEditors, fetchList } from '../content.js';

import Spinner from '../components/Spinner.js';
import LevelAuthors from '../components/List/LevelAuthors.js';

const roleIconMap = {
    owner: 'crown',
    admin: 'user-gear',
    helper: 'user-shield',
    dev: 'code',
    trial: 'user-lock',
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 100" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">#Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </div>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>#{{ selected + 1 }} – {{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" :src="embed(level.verification)" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Puntos al completar:</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID:</div>
                            <p class="type-label-lg">{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Contraseña:</div>
                            <p>{{ level.password || 'Copiable' }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Dificultad:</div>
                            <p>{{ level.difficulty || 'Demon' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 100"><strong>{{ level.percentToQualify }}%</strong> o mas para Registrar Record</p>
                    <p v-else>Este nivel ya no acepta nuevos Records!</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}Hz</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻ La puta madre!!! | Error code: 303</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p>All credit goes to <a href="https://tsl.pages.dev/#/" target="_blank">TSL</a> (The Shitty List), whose website this is a replica of. We obtained permission from its owners and have no connection to TSL. Original List by <a href="https://me.redlimerl.com/" target="_blank">RedLime</a></p>
                    </div>
                    <div class="og">
                        <iframe src="https://discord.com/widget?id=1060697045570171070&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Frequently Asked Questions</h3>
                    <p>
                        Q: How long will it take for my record to be accepted?
                        <br>
                        A: On an average day, it will take 0–48 hours, occasionally up to 72 hours, which may be slightly unusual, for the record to be acknowledged. You can ask a team member if the record hasn't been accepted yet and they can perhaps help.
                    </p>
                    <p>
                        Q: What does it mean by new, update, and fix records?
                        <br>
                        A: When you submit a record for a level for the first time, choose "New Record," and when you need to update an existing record because you have a new best, pick "Update Record," If there is a problem with one of your records that has to be fixed, select "Fix Record."
                    </p>
                    <p>
                        Q: What time will __ be placed on the list?
                        <br>
                        A: Typically, we add 1-3 demons per changelog. The level(s) in question must be added to the list within 2 to 4 days. However, not everything will be accurate because there could be website troubles or because some levels might take longer to upload than others. Be patient, please!
                    </p>
                    <p>
                        Q: Can I upload a video with multiple levels?
                        <br>
                        A: Yes!
                    </p>
                    <p>
                        Si tienes preguntas u otro no dudes en meterte en el discord para contactar con nosotros.
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store,
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                'Opps fallo el cargado de la lista intenta luego o contacta al Staff | Error Code: 3',
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Opps el nivel no se cargo. (${err}.json) | Error Code: 1`;
                    }),
            );
            if (!this.editors) {
                this.errors.push('Opps No se pudo cargar a los staff de la lista | Error Code: 2');
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
