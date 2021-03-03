
export type CustomGet<K extends string, TCustom> = K & { __type__: TCustom };

export function T<TCustom>(k: string): CustomGet<string, TCustom> {
	return k as CustomGet<string, Readonly<TCustom>>;
}

export namespace UserSettings {
	export const GP = T<number>('GP');
	export const Vault = T<O.Readonly<ItemBank>>('Vault');
	export const Pets = T<O.Readonly<ItemBank>>('pets');
	export const CollectionLogBank = T<O.Readonly<ItemBank>>('collectionLogBank');
	export const GodScores = T<O.Readonly<ItemBank>>('godScores');
	export const DungeonScores = T<O.Readonly<ItemBank>>('dungeonScores');
	export const LastDailyTimestamp = T<number>('lastDailyTimestamp');
	export const FavoriteItems = T<readonly number[]>('favoriteItems');
	export const NME = T<string>('NME');

  export namespace Stats {
		export const Deaths = T<number>('stats.deaths');

		export const DiceWins = T<number>('stats.diceWins');
		export const DiceLosses = T<number>('stats.diceLosses');

		export const DuelWins = T<number>('stats.duelWins');
		export const DuelLosses = T<number>('stats.duelLosses');

	}

	export namespace Account {
		export const Name = T<string>('account.name');
		export const HasBought = T<boolean>('account.hasBought');
		export const DailyDuration = T<number>('account.dailyDuration');
		export const Icon = T<string | null>('account.icon');

    export namespace Character
    {
      export const EquippedPet = T<number | null>('account.equippedPet');
      export const Name = T<string>('character.name');

      //Boolean
      export const Ppe = T<boolean>('account.ppe');

      export namespace Skills {

        //Regular stats
    		export const Health = T<number>(`skills.${SkillsEnum.Health}`);
    		export const Mana = T<number>(`skills.${SkillsEnum.Mana}`);
    		export const Attack = T<number>(`skills.${SkillsEnum.Attack}`);
    		export const Defense = T<number>(`skills.${SkillsEnum.Defense}`);
    		export const Dexterity = T<number>(`skills.${SkillsEnum.Dexterity}`);
    		export const Speed = T<string>(`skills.${SkillsEnum.Speed}`);
    		export const Wisdom = T<number>(`skills.${SkillsEnum.Wisdom}`);
    		export const Vitality = T<number>(`skills.${SkillsEnum.Vitality}`);

        //Exaltations
    		export const HealthExalt = T<number>(`skills.${SkillsEnum.HealthExalt}`);
    		export const ManaExalt = T<number>(`skills.${SkillsEnum.ManaExalt}`);
    		export const AttackExalt = T<number>(`skills.${SkillsEnum.AttackExalt}`);
    		export const DefenseExalt = T<number>(`skills.${SkillsEnum.DefenseExalt}`);
    		export const DexterityExalt = T<number>(`skills.${SkillsEnum.DexterityExalt}`);
    		export const SpeedExalt = T<number>(`skills.${SkillsEnum.SpeedExalt}`);
    		export const WisdomExalt = T<number>(`skills.${SkillsEnum.WisdomExalt}`);
    		export const VitalityExalt = T<number>(`skills.${SkillsEnum.VitalityExalt}`);
    	}

    	export namespace Gear {
    		export const Weapon = T<GearSetup | null>(`gear.weapon`);
    		export const Ability = T<GearSetup | null>(`gear.ability`);
    		export const Armor = T<GearSetup | null>(`gear.armor`);
    		export const Ring = T<GearSetup | null>(`gear.ring`);
    	}
    }
	}
