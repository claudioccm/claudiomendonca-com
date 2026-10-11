import { describe, it, expect } from 'vitest'
import { splitTitle } from '../app/utils/format'

describe('splitTitle', () => {
  it('lifts the part before the first ": " into the brow', () => {
    expect(splitTitle('Trade Business Job Scheduling: From Paper Diary to Talking Assistant')).toEqual({
      brow: 'Trade Business Job Scheduling',
      title: 'From Paper Diary to Talking Assistant',
    })
  })

  it('splits only on the first separator', () => {
    expect(splitTitle('A: B: C')).toEqual({ brow: 'A', title: 'B: C' })
  })

  it('leaves titles without the pattern whole', () => {
    expect(splitTitle('Reusable Brand Voice Templates')).toEqual({ brow: null, title: 'Reusable Brand Voice Templates' })
    expect(splitTitle('Open at 10:30')).toEqual({ brow: null, title: 'Open at 10:30' })
    expect(splitTitle(': Leading')).toEqual({ brow: null, title: ': Leading' })
    expect(splitTitle('Trailing: ')).toEqual({ brow: null, title: 'Trailing: ' })
  })
})
