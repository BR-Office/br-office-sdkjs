/*
 * (c) Copyright Ascensio System SIA 2010-2024
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

/*
 * Checks that the precomputed script -> direction table of
 * AscFonts.hb_get_script_horizontal_direction equals the reference switch for every value.
 */
$(function ()
{
	QUnit.module("libfont: hb_get_script_horizontal_direction");

	QUnit.test("table equals switch for every HB_SCRIPT value", function (assert)
	{
		const table = AscFonts.hb_get_script_horizontal_direction;
		const ref   = AscFonts.hb_get_script_horizontal_direction_switch;
		assert.strictEqual(typeof ref, "function", "reference switch is exported");
		let count = 0, rtl = 0;
		for (let name in AscFonts.HB_SCRIPT)
		{
			const script = AscFonts.HB_SCRIPT[name];
			const expected = ref(script);
			if (table(script) !== expected)
				assert.strictEqual(table(script), expected, name);
			if (expected === AscFonts.HB_DIRECTION.HB_DIRECTION_RTL)
				rtl++;
			count++;
		}
		assert.ok(count > 100, "checked " + count + " HB_SCRIPT values");
		assert.ok(rtl > 20, rtl + " RTL scripts");
	});

	QUnit.test("known scripts and non-members", function (assert)
	{
		const S = AscFonts.HB_SCRIPT, D = AscFonts.HB_DIRECTION;
		const f = AscFonts.hb_get_script_horizontal_direction;
		assert.strictEqual(f(S.HB_SCRIPT_LATIN), D.HB_DIRECTION_LTR, "Latin");
		assert.strictEqual(f(S.HB_SCRIPT_COMMON), D.HB_DIRECTION_LTR, "Common");
		assert.strictEqual(f(S.HB_SCRIPT_ARABIC), D.HB_DIRECTION_RTL, "Arabic");
		assert.strictEqual(f(S.HB_SCRIPT_HEBREW), D.HB_DIRECTION_RTL, "Hebrew");
		[0, 1, -1, 12345, 4294967295, undefined, null].forEach(function (v)
		{
			assert.strictEqual(f(v), AscFonts.hb_get_script_horizontal_direction_switch(v), "value " + v);
		});
	});
});
